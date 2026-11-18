import { Settings2 } from 'lucide-react'

const ROWS = [['Container', 'MP4'], ['Video', 'H.264 (AVC), 8-bit SDR'], ['Audio', 'AAC stereo'], ['Frame rate', '30 FPS'], ['Resolution', 'Up to 1080p, never upscaled']]

export default function ConversionSettings() {
  return (
    <section className="card">
      <h2><Settings2 size={18} /> Recommended settings</h2>
      <dl className="settings">{ROWS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </section>
  )
}
