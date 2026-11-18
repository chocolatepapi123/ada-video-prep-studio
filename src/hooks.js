import { useCallback, useEffect, useRef, useState } from 'react'
import { convert, cancelFFmpeg } from './utils/ffmpeg.js'
import { isVideo, probe, checkCompat, outputName } from './utils/videoUtils.js'
import { saveItem, deleteItem, clearItems, loadItems } from './utils/store.js'

let nextId = 1
const SNAPSHOT_LIMIT = 300 * 1024 * 1024

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

  // Restore saved queue and finished videos after a reload.
  useEffect(() => {
    loadItems().then((recs) => {
      if (!recs || !recs.length) return
      recs.sort((a, b) => a.id - b.id)
      nextId = Math.max(nextId, ...recs.map((r) => r.id + 1))
      const restored = recs.map((r) => ({
        ...r,
        status: r.status === 'done' ? 'done' : 'queued',
        progress: r.status === 'done' ? 1 : 0,
        url: r.blob ? URL.createObjectURL(r.blob) : undefined,
        error: null
      }))
      setItems((cur) => [...restored, ...cur])
    })
  }, [])

  const add = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter(isVideo)
    const fresh = files.map((file) => ({ id: nextId++, file, status: 'queued', progress: 0, info: {}, compat: null }))
    setItems((l) => [...l, ...fresh])
    for (const it of fresh) {
      let file = it.file
      // Copy the bytes into memory right away: Android can revoke access to picked files later.
      if (file.size < SNAPSHOT_LIMIT) {
        try { file = new File([await file.arrayBuffer()], file.name, { type: file.type, lastModified: file.lastModified }) } catch {}
      }
      const info = await probe(file)
      const compat = checkCompat(file, info)
      patch(it.id, { file, info, compat })
      saveItem({ id: it.id, file, status: 'queued', info, compat })
    }
    return files.length
  }, [patch])

  const revoke = (i) => i.url && URL.revokeObjectURL(i.url)

  const remove = useCallback((id) => {
    const it = itemsRef.current.find((i) => i.id === id)
    if (!it) return
    if (running.current === id) { cancelled.current.add(id); cancelFFmpeg(); abort.current?.(new Error('cancelled')) }
    revoke(it)
    deleteItem(id)
    setItems((l) => l.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => {
    if (running.current) { cancelled.current.add(running.current); cancelFFmpeg(); abort.current?.(new Error('cancelled')) }
    itemsRef.current.forEach(revoke)
    clearItems()
    setItems([])
  }, [])

  const start = useCallback(async (maxShort = 1080) => {
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
        const blob = await Promise.race([convert(it.file, (p) => { setTask('Converting video…'); patch(id, { progress: p }) }, null, maxShort), stop])
        if (cancelled.current.has(id)) continue
        const done = { status: 'done', progress: 1, blob, url: URL.createObjectURL(blob), outName: outputName(it.file.name), outSize: blob.size }
        patch(id, done)
        saveItem({ id, file: it.file, info: it.info, compat: it.compat, status: 'done', blob, outName: done.outName, outSize: blob.size })
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
