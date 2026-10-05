// app/api/apply/route.js
// Internship applications from ApplyModal. Validates the form, then (in
// parallel) emails it to the internships inbox with the CV attached, and saves
// it in Sanity as a jobApplication with the CV stored as a file. Succeeds if
// either works, so an application is never lost.

import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWriteClient'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_CV_BYTES = 4 * 1024 * 1024
const CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

// Override in Vercel env vars if needed (e.g. your own address on Preview)
const APPLY_TO = (process.env.APPLY_TO_EMAIL || 'internships@templetonresearch.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const NOTIFY_FROM =
  process.env.CONTACT_FROM_EMAIL || 'Templeton Research Website <website@templetonresearch.com>'

async function sendEmail({ name, email, message, filename, buffer }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  const text = [
    'New internship application from the website.',
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
      to: APPLY_TO,
      reply_to: email,
      subject: `Internship application from ${name}`,
      text,
      attachments: [{ filename, content: buffer.toString('base64') }],
    }),
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
}

async function saveToSanity({ name, email, message, filename, contentType, buffer }) {
  const asset = await writeClient.assets.upload('file', buffer, { filename, contentType })
  await writeClient.create({
    _type: 'jobApplication',
    name,
    email,
    message: message || undefined,
    cv: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
    submittedAt: new Date().toISOString(),
  })
}

export async function POST(request) {
  let form
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real people never see this field
  if ((form.get('website') || '').toString().trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = (form.get('name') || '').toString().trim()
  const email = (form.get('email') || '').toString().trim()
  const message = (form.get('message') || '').toString().trim()
  const cv = form.get('cv')

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
  const payload = { name, email, message, filename, contentType: CV_TYPES[ext], buffer }

  const [emailed, saved] = await Promise.allSettled([sendEmail(payload), saveToSanity(payload)])
  if (emailed.status === 'rejected') console.error('Apply: email failed:', emailed.reason)
  if (saved.status === 'rejected') console.error('Apply: Sanity save failed:', saved.reason)

  if (emailed.status === 'rejected' && saved.status === 'rejected') {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
