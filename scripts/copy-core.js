// Copies the single-threaded FFmpeg core into public/ffmpeg so it is served
// from our own origin under the GitHub Pages subpath (no CDN, no COOP/COEP).
import { cpSync, mkdirSync } from 'node:fs'
const src = 'node_modules/@ffmpeg/core/dist/esm'
mkdirSync('public/ffmpeg', { recursive: true })
for (const f of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) cpSync(`${src}/${f}`, `public/ffmpeg/${f}`)
console.log('FFmpeg core copied to public/ffmpeg')
