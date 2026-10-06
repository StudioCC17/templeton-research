// app/api/contact/route.js
// Receives the contact form POST, validates it, stores a
// contactSubmission document in Sanity, and emails a notification
// via Resend. Runs on the server only.

import { NextResponse } from 'next/server'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { writeClient } from '@/lib/sanityWriteClient'
import { bccFor } from '@/lib/formCopy'

// Route handlers run on the Node runtime by default, which is what the
// Sanity client needs. Stated explicitly here for clarity.
export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Notification settings. Override in Vercel env vars if these ever change.
const NOTIFY_TO = (process.env.CONTACT_TO_EMAIL ||
  'marko@templetonresearch.com,info@templetonresearch.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const NOTIFY_FROM =
  process.env.CONTACT_FROM_EMAIL || 'Templeton Research Website <website@templetonresearch.com>'

// Plain-text email so nothing a visitor types can be rendered as HTML.
async function sendNotification({ name, email, company, message }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')

  const text = [
    'New enquiry from the website contact form.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || '-'}`,
    '',
    'Message:',
    message,
    '',
    '---',
    'Reply to this email to respond directly to the sender.',
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      ...(bccFor(NOTIFY_TO).length ? { bcc: bccFor(NOTIFY_TO) } : {}), // TEMPORARY copy to Edd (lib/formCopy.js)
      reply_to: email,
      subject: `Website enquiry from ${name}${company ? ` (${company})` : ''}`,
      text,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
  }
}

export async function POST(request) {
  if (!rateLimit(`contact:${clientIp(request)}`)) {
    console.warn(`Contact: rate limited ${clientIp(request)}`)
    return NextResponse.json(
      { error: 'Too many submissions - please try again in a few minutes.' },
      { status: 429 }
    )
  }
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = body?.name?.trim()
  const email = body?.email?.trim()
  const company = body?.company?.trim()
  const message = body?.message?.trim()

  // Validation
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email and message are required.' },
      { status: 400 }
    )
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 })
  }

  // Save to Sanity and send the email independently, so one failing
  // doesn't lose the enquiry. Succeed if at least one worked.
  const [saved, emailed] = await Promise.allSettled([
    writeClient.create({
      _type: 'contactSubmission',
      name,
      email,
      company: company || undefined,
      message,
      submittedAt: new Date().toISOString(),
    }),
    sendNotification({ name, email, company, message }),
  ])

  if (saved.status === 'rejected') {
    console.error('Contact submission: Sanity save failed:', saved.reason)
  }
  if (emailed.status === 'rejected') {
    console.error('Contact submission: email notification failed:', emailed.reason)
  }

  if (saved.status === 'rejected' && emailed.status === 'rejected') {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
