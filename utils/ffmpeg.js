import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// Single-threaded core: no SharedArrayBuffer, so no COOP/COEP headers needed (works on GitHub Pages).
const base = `${import.meta.env.BASE_URL}ffmpeg/`
let ff = null

export async function getFFmpeg(onLog) {
  if (ff && ff.loaded) return ff
  ff = new FFmpeg()
  if (onLog) ff.on('log', ({ message }) => onLog(message))
  await ff.load({
    coreURL: await toBlobURL(`${base}ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}ffmpeg-core.wasm`, 'application/wasm')
  })
  return ff
}

export function cancelFFmpeg() {
  if (ff) { ff.terminate(); ff = null }
}

// Fit within maxShort on the short side, never upscale, keep aspect ratio, force even dimensions.
const buildVF = (m) => [
  `scale='if(gt(iw,ih),-2,min(${m},iw))':'if(gt(iw,ih),min(${m},ih),-2)'`,
  'scale=trunc(iw/2)*2:trunc(ih/2)*2',
  'fps=30',
  'format=yuv420p'
].join(',')

export async function convert(file, onProgress, onLog, maxShort = 1080) {
  const ffmpeg = await getFFmpeg(onLog)
  const handler = ({ progress }) => onProgress(Math.min(1, Math.max(0, progress)))
  ffmpeg.on('progress', handler)
  const input = 'in_' + Date.now() + '.' + (file.name.split('.').pop() || 'mp4')
  const output = 'out.mp4'
  try {
    await ffmpeg.writeFile(input, await fetchFile(file))
    const code = await ffmpeg.exec([
      '-i', input, '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', buildVF(maxShort), '-r', '30',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-profile:v', 'main', '-bf', '0', '-g', '30', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2',
      '-movflags', '+faststart', '-y', output
    ])
    if (code !== 0) throw new Error('FFmpeg could not convert this file. It may be damaged or use an unsupported codec.')
    const data = await ffmpeg.readFile(output)
    if (!data || !data.length) throw new Error('Conversion produced an empty file.')
    return new Blob([data.buffer], { type: 'video/mp4' })
  } finally {
    ffmpeg.off('progress', handler)
    try { await ffmpeg.deleteFile(input) } catch {}
    try { await ffmpeg.deleteFile(output) } catch {}
  }
}
