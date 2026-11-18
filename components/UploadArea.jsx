import { useRef, useState } from 'react'
import { UploadCloud, Images } from 'lucide-react'

export default function UploadArea({ onFiles, compact }) {
  const filesInput = useRef(null)
  const galleryInput = useRef(null)
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

      <button className="btn primary" onClick={() => filesInput.current.click()}>Choose from files</button>
      {/* No accept attribute: Android then opens the Files browser instead of Google Photos */}
      <input ref={filesInput} type="file" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = '' }} />

      <div>
        <button className="btn ghost small" style={{ marginTop: 10 }} onClick={() => galleryInput.current.click()}>
          <Images size={16} /> Pick from gallery
        </button>
        <input ref={galleryInput} type="file" accept="video/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
      </div>

      <p className="hint desktop-only">or drag and drop videos here</p>
    </section>
  )
}
