import { Play, Square, Trash2 } from 'lucide-react'

export default function ProcessingPanel({ items, busy, task, onStart, onCancel, onClear }) {
  const total = items.length
  const done = items.filter((i) => i.status === 'done').length
  const cur = items.find((i) => i.status === 'processing')
  const overall = total ? ((done + (cur ? cur.progress : 0)) / total) * 100 : 0
  const pending = items.filter((i) => i.status === 'queued' || i.status === 'error').length
  return (
    <section className="card">
      <div className="row"><strong>{done} of {total} converted</strong><span className="sub">{Math.round(overall)}%</span></div>
      <div className="bar"><div style={{ width: `${overall}%` }} /></div>
      {busy && <div className="sub task">{task}</div>}
      <div className="actions">
        {busy
          ? <button className="btn danger" onClick={onCancel}><Square size={16} /> Cancel</button>
          : <button className="btn primary" disabled={!pending} onClick={onStart}><Play size={16} /> {done ? 'Convert remaining' : 'Convert all'}</button>}
        <button className="btn ghost" onClick={onClear}><Trash2 size={16} /> Clear</button>
      </div>
    </section>
  )
}
