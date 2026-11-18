import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { ACCEPT } from '../utils/videoUtils.js'

export default function UploadArea({ onFiles, compact }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const pick = (files) => files && files.length && onFiles(files)
  return (
    <section
      className={`card upload ${over ? 'over' : ''} ${compact ? 'compact' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files) }}
    >
      {!compact && <UploadCloud size={48} className="accent" />}
      <h1>{compact ? 'Add more videos' : 'Prepare your videos'}</h1>
      {!compact && <p>Convert videos into a format that works almost everywhere.</p>}
      <button className="btn primary" onClick={() => input.current.click()}>Choose videos</button>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
      <p className="hint desktop-only">or drag and drop videos here</p>
    </section>
  )
}
