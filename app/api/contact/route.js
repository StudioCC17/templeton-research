// app/api/contact/route.js
// Receives the contact form POST, validates it, and stores a
// contactSubmission document in Sanity. Runs on the server only.

import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWriteClient'

// Route handlers run on the Node runtime by default, which is what the
// Sanity client needs. Stated explicitly here for clarity.
export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
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

  try {
    await writeClient.create({
      _type: 'contactSubmission',
      name,
      email,
      company: company || undefined,
      message,
      submittedAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact submission failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
