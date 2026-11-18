import { useCallback, useRef, useState } from 'react'
import { convert, cancelFFmpeg } from './utils/ffmpeg.js'
import { isVideo, probe, checkCompat, outputName } from './utils/videoUtils.js'

let nextId = 1

export function useQueue() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [current, setCurrent] = useState(null)
  const [task, setTask] = useState('')
  const cancelled = useRef(new Set())
  const running = useRef(null)
  const abort = useRef(null)
  const itemsRef = useRef([])
  itemsRef.current = items

  const patch = useCallback((id, p) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i))), [])

  const add = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter(isVideo)
    const fresh = files.map((file) => ({ id: nextId++, file, status: 'queued', progress: 0, info: {}, compat: null }))
    setItems((l) => [...l, ...fresh])
    for (const it of fresh) {
      const info = await probe(it.file)
      patch(it.id, { info, compat: checkCompat(it.file, info) })
    }
    return files.length
  }, [patch])

  const revoke = (i) => i.url && URL.revokeObjectURL(i.url)

  const remove = useCallback((id) => {
    const it = itemsRef.current.find((i) => i.id === id)
    if (!it) return
    if (running.current === id) { cancelled.current.add(id); cancelFFmpeg(); abort.current?.(new Error('cancelled')) }
    revoke(it)
    setItems((l) => l.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => {
    if (running.current) { cancelled.current.add(running.current); cancelFFmpeg(); abort.current?.(new Error('cancelled')) }
    itemsRef.current.forEach(revoke)
    setItems([])
  }, [])

  const start = useCallback(async () => {
    setBusy(true)
    const todo = itemsRef.current.filter((i) => i.status === 'queued' || i.status === 'error').map((i) => i.id)
    for (const id of todo) {
      const it = itemsRef.current.find((i) => i.id === id)
      if (!it) continue
      running.current = id
      setCurrent(id)
      patch(id, { status: 'processing', progress: 0, error: null })
      setTask('Loading converter…')
      try {
        const stop = new Promise((_, rej) => { abort.current = rej })
        const blob = await Promise.race([convert(it.file, (p) => { setTask('Converting video…'); patch(id, { progress: p }) }), stop])
        if (cancelled.current.has(id)) continue
        patch(id, { status: 'done', progress: 1, blob, url: URL.createObjectURL(blob), outName: outputName(it.file.name), outSize: blob.size })
      } catch (e) {
        if (cancelled.current.has(id)) continue
        patch(id, { status: 'error', error: e.message || 'Conversion failed.' })
      }
    }
    running.current = null
    setCurrent(null)
    setTask('')
    setBusy(false)
  }, [patch])

  return { items, busy, current, task, add, remove, clear, start }
}

export function download(url, name) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}
