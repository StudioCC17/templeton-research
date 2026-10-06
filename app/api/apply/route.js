// app/api/apply/route.js
// Careers applications from ApplyModal - general CVs ('cv') go to careers@,
// internship applications ('internship') go to internships@. Validates the form, then
// emails it with the CV attached. Nothing is stored (CVs are personal data and
// stay out of Sanity, whose datasets are public on the current plan). If the
// email fails the applicant sees an error and can try again.

import { NextResponse } from 'next/server'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { bccFor } from '@/lib/formCopy'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_CV_BYTES = 4 * 1024 * 1024
const CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const TYPES = {
  cv: { to: 'careers@templetonresearch.com, marko@templetonresearch.com', label: 'CV submission' },
  internship: { to: 'internships@templetonresearch.com, marko@templetonresearch.com', label: 'Internship application' },
}

// APPLY_TO_EMAIL (Vercel env) overrides the recipient for both types -
// handy on Preview so test applications come to you.
const recipients = (type) =>
  (process.env.APPLY_TO_EMAIL || TYPES[type].to)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
const NOTIFY_FROM =
  process.env.CONTACT_FROM_EMAIL || 'Templeton Research Website <website@templetonresearch.com>'

async function sendEmail({ type, name, email, message, filename, buffer }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  const text = [
    `New ${TYPES[type].label.toLowerCase()} from the website.`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Note:',
    message || '-',
    '',
    `CV attached: ${filename}`,
    '',
    '---',
    'Reply to this email to respond directly to the applicant.',
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: recipients(type),
      ...(bccFor(recipients(type)).length ? { bcc: bccFor(recipients(type)) } : {}), // TEMPORARY copy to Edd (lib/formCopy.js)
      reply_to: email,
      subject: `${TYPES[type].label} from ${name}`,
      text,
      attachments: [{ filename, content: buffer.toString('base64') }],
    }),
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
}

export async function POST(request) {
  if (!rateLimit(`apply:${clientIp(request)}`)) {
    console.warn(`Apply: rate limited ${clientIp(request)}`)
    return NextResponse.json(
      { error: 'Too many submissions - please try again in a few minutes.' },
      { status: 429 }
    )
  }
  let form
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real people never see this field
  const hp = (form.get('hp_check') || '').toString().trim()
  if (hp) {
    console.warn(`Apply: honeypot filled ("${hp.slice(0, 30)}") - treated as spam, nothing sent`)
    return NextResponse.json({ ok: true })
  }

  const name = (form.get('name') || '').toString().trim()
  const email = (form.get('email') || '').toString().trim()
  const message = (form.get('message') || '').toString().trim()
  const cv = form.get('cv')
  const type = TYPES[form.get('type')] ? form.get('type').toString() : 'internship'

  if (!name || !email) {
    return NextResponse.json({ error: 'Please add your name and email.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 })
  }
  if (!cv || typeof cv === 'string' || !cv.size) {
    return NextResponse.json({ error: 'Please attach your CV.' }, { status: 400 })
  }
  const ext = (cv.name || '').split('.').pop().toLowerCase()
  if (!CV_TYPES[ext]) {
    return NextResponse.json({ error: 'Please upload your CV as a PDF or Word document.' }, { status: 400 })
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: 'Your CV is over 4MB. Please upload a smaller file.' }, { status: 400 })
  }

  const buffer = Buffer.from(await cv.arrayBuffer())
  const filename = (cv.name || `cv.${ext}`).replace(/[^\w.\- ]/g, '_')
  const payload = { type, name, email, message, filename, buffer }

  try {
    await sendEmail(payload)
  } catch (err) {
    console.error('Apply: email failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
  console.log(`Apply: ${type} from ${email} - emailed to ${recipients(type).join(', ')}`)
  return NextResponse.json({ ok: true })
}
