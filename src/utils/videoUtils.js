export const ACCEPT = '.mp4,.mov,.m4v,.webm,.mkv,.avi,.3gp,video/*'
const EXT = ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi', '3gp']

export const extOf = (name) => (name.split('.').pop() || '').toLowerCase()
export const isVideo = (f) => f.type.startsWith('video/') || EXT.includes(extOf(f.name))

export function formatSize(b) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  if (b < 1024 ** 3) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 ** 3).toFixed(2)} GB`
}

export function formatDuration(s) {
  if (!Number.isFinite(s)) return 'Unknown'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`
}

export const outputName = (name) => (name.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '').trim() || 'video') + '.mp4'

// Reads duration and dimensions with a <video> element (works if the browser can decode the file).
export function probe(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    const done = (info) => { URL.revokeObjectURL(url); v.removeAttribute('src'); v.load(); resolve(info) }
    v.preload = 'metadata'
    v.onloadedmetadata = () => done({ duration: v.duration, width: v.videoWidth, height: v.videoHeight })
    v.onerror = () => done({})
    setTimeout(() => done({}), 8000)
    v.src = url
  })
}

// Honest check: the browser cannot read codec or frame rate, so only container and size are judged.
export function checkCompat(file, info) {
  const ext = extOf(file.name)
  const reasons = []
  if (ext !== 'mp4') reasons.push(`${ext.toUpperCase()} container needs MP4`)
  if (Math.min(info.width || 0, info.height || 0) > 1080) reasons.push('Larger than 1080p')
  if (!reasons.length) return { ok: true, text: 'MP4 detected. Codec and frame rate will be normalised to H.264, AAC and 30 FPS.' }
  return { ok: false, text: reasons.join(' · ') }
}
