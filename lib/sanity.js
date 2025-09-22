// lib/sanity.js
// Updated Sanity client configuration with image and video URL builder

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'jzefrw3z', // Your project ID
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // set to true for production
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

// Helper function to get file URL (for videos and other files)
export function getFileUrl(asset) {
  if (!asset?._ref) return null
  
  const [_file, id, extension] = asset._ref.split('-')
  return `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${id}.${extension}`
}

// Helper function that works for both images and videos
export function getMediaUrl(asset) {
  if (!asset) return null
  
  // Check if it's an image asset
  if (asset._ref && asset._ref.includes('image-')) {
    return urlFor(asset).url()
  }
  
  // Check if it's a file asset (video)
  if (asset._ref && asset._ref.includes('file-')) {
    return getFileUrl(asset)
  }
  
  return null
}