// lib/sanityWriteClient.js
// A separate, server-only Sanity client that carries a write token.
// Keep this out of any client component. It is imported only by the
// /api/contact route handler, which runs on the server, so the token
// is never sent to the browser.

import { createClient } from '@sanity/client'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // never use the CDN for writes
})
