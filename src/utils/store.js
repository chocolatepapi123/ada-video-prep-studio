// Tiny IndexedDB wrapper so the queue and converted videos survive reloads.
const run = (mode, fn) => new Promise((resolve, reject) => {
  const open = indexedDB.open('rada-video-studio', 1)
  open.onupgradeneeded = () => open.result.createObjectStore('items', { keyPath: 'id' })
  open.onerror = () => reject(open.error)
  open.onsuccess = () => {
    const db = open.result
    const tx = db.transaction('items', mode)
    const req = fn(tx.objectStore('items'))
    tx.oncomplete = () => { db.close(); resolve(req && req.result) }
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error) }
  }
})
export const saveItem = (rec) => run('readwrite', (s) => s.put(rec)).catch(() => {})
export const deleteItem = (id) => run('readwrite', (s) => s.delete(id)).catch(() => {})
export const clearItems = () => run('readwrite', (s) => s.clear()).catch(() => {})
export const loadItems = () => run('readonly', (s) => s.getAll()).catch(() => [])
