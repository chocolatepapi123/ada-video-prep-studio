import { useState } from 'react'
import { UploadCloud, Images } from 'lucide-react'

// Each click creates a fresh <input> that is kept alive. Clearing or reusing one input
// can make Android Chrome invalidate the File handles of earlier selections.
const keep = []
function openPicker(accept, onFiles) {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  if (accept) input.accept = accept
  input.onchange = () => { if (input.files && input.files.length) onFiles(input.files) }
  keep.push(input)
  input.click()
}

export default function UploadArea({ onFiles, compact }) {
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
      <button className="btn primary" onClick={() => openPicker('', onFiles)}>Choose from files</button>
      <div>
        <button className="btn ghost small" style={{ marginTop: 10 }} onClick={() => openPicker('video/*', onFiles)}>
          <Images size={16} /> Pick from gallery
        </button>
      </div>
      <p className="hint desktop-only">or drag and drop videos here</p>
    </section>
  )
}
