import { useState } from 'react'
import Header from './components/Header.jsx'
import UploadArea from './components/UploadArea.jsx'
import VideoQueue from './components/VideoQueue.jsx'
import ConversionSettings from './components/ConversionSettings.jsx'
import ProcessingPanel from './components/ProcessingPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import { useQueue } from './hooks.js'

export default function App() {
  const q = useQueue()
  const [notice, setNotice] = useState('')
  const [maxShort, setMaxShort] = useState(1080)
  const onFiles = async (files) => {
    const n = await q.add(files)
    setNotice(n ? '' : 'None of those files look like videos. Try MP4, MOV, M4V, WEBM, MKV, AVI or 3GP.')
  }
  return (
    <div className="app">
      <Header />
      <main>
        <UploadArea onFiles={onFiles} compact={q.items.length > 0} />
        {notice && <div className="card err-card">{notice}</div>}
        {q.items.length > 0 && (
          <>
            <ProcessingPanel items={q.items} busy={q.busy} task={q.task} onStart={() => q.start(maxShort)} onCancel={() => q.current && q.remove(q.current)} onClear={q.clear} />
            <VideoQueue items={q.items} onRemove={q.remove} />
            <ResultsPanel items={q.items} />
          </>
        )}
        <ConversionSettings maxShort={maxShort} onChange={setMaxShort} disabled={q.busy} />
      </main>
      <footer>Private by design. Your videos never leave your device. · Version 1.2</footer>
    </div>
  )
}
