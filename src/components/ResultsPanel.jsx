import { Download, PartyPopper } from 'lucide-react'
import { download } from '../hooks.js'

export default function ResultsPanel({ items }) {
  const done = items.filter((i) => i.status === 'done')
  if (!done.length) return null
  // Sequential downloads with a short gap so mobile browsers do not drop them.
  const all = async () => { for (const i of done) { download(i.url, i.outName); await new Promise((r) => setTimeout(r, 600)) } }
  return (
    <section className="card results">
      <h2><PartyPopper size={18} className="accent" /> {done.length} video{done.length > 1 ? 's' : ''} ready</h2>
      <button className="btn primary" onClick={all}><Download size={16} /> Download all</button>
    </section>
  )
}
