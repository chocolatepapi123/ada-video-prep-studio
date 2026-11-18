import { Settings2 } from 'lucide-react'

const ROWS = [['Container', 'MP4'], ['Video', 'H.264 (AVC), 8-bit SDR'], ['Audio', 'AAC stereo'], ['Frame rate', 'Constant 30 FPS']]
const OPTIONS = [[1080, '1080p', 'Best quality'], [720, '720p', 'For video editors']]

export default function ConversionSettings({ maxShort, onChange, disabled }) {
  return (
    <section className="card">
      <h2><Settings2 size={18} /> Settings</h2>
      <dl className="settings">{ROWS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="seg" role="radiogroup" aria-label="Maximum resolution">
        {OPTIONS.map(([v, label, sub]) => (
          <button key={v} role="radio" aria-checked={maxShort === v} disabled={disabled}
            className={maxShort === v ? 'on' : ''} onClick={() => onChange(v)}>
            <strong>{label}</strong><span>{sub}</span>
          </button>
        ))}
      </div>
      <p className="hint" style={{ margin: '10px 0 0' }}>Never upscaled. Choose 720p if an editor like ChatCut won't decode your clips.</p>
    </section>
  )
}
