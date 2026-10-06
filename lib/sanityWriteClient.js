// lib/sanityWriteClient.js
// A separate, server-only Sanity client that carries a write token.
// Used only by the /api/contact and /api/apply route handlers, which run on
// the server, so the token is never sent to the browser.
//
// Form submissions (enquiries and job applications, incl. CVs) are personal
// data, so they're written to their own PRIVATE dataset ('submissions'),
// not the public 'production' dataset the website reads its content from.
// A private dataset can only be read with a token, so nobody can query them
// through the public API.

import { createClient } from '@sanity/client'

export const SUBMISSIONS_DATASET = process.env.SANITY_SUBMISSIONS_DATASET || 'submissions'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: SUBMISSIONS_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // never use the CDN for writes
})
