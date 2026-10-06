// lib/rateLimit.js
// Light, dependency-free rate limit for the form endpoints, keyed by the
// visitor's IP. Stops a bot flooding the inboxes (and the Resend allowance).
// It lives in memory, so each Vercel instance keeps its own count - that's
// fine for this purpose; real people never get near the limit.

const hits = new Map()

export function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for') || ''
  return fwd.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
}

// Returns true if this request is allowed.
export function rateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  // Keep the map from growing forever
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
  }
  return true
}
