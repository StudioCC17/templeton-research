// lib/video.js
// Background videos play a touch slower than shot, for a calmer feel.
// Set once here; used by every <video> on the site. (Once the looped, optimised
// files are made, this speed can be baked into them and set back to 1.)
export const VIDEO_SPEED = 0.8 // 20% slower

// Use as onLoadedMetadata + onTimeUpdate so the speed sticks even if the video
// started before the page finished loading.
export const applyVideoSpeed = (e) => {
  const v = e.currentTarget
  if (v.playbackRate !== VIDEO_SPEED) {
    v.defaultPlaybackRate = VIDEO_SPEED
    v.playbackRate = VIDEO_SPEED
  }
}
