// lib/sanityWriteClient.js
// A separate, server-only Sanity client that carries a write token.
// Used only by the /api/contact and /api/apply route handlers, which run on
// the server, so the token is never sent to the browser.

import { createClient } from '@sanity/client'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // never use the CDN for writes
})
