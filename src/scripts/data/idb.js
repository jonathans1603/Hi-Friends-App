// IndexedDB: store "stories" (status tersimpan) & "outbox" (status menunggu dikirim saat offline)
const open = () => new Promise((res, rej) => {
  const r = indexedDB.open('hi-friends', 1);
  r.onupgradeneeded = () => {
    r.result.createObjectStore('stories', { keyPath: 'id' });
    r.result.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
  };
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode); const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req.result); t.onerror = () => rej(t.error);
  });
}
export const saveStory = (s) => tx('stories', 'readwrite', (st) => st.put(s));          // Create
export const getSaved = () => tx('stories', 'readonly', (st) => st.getAll());           // Read
export const getSavedOne = (id) => tx('stories', 'readonly', (st) => st.get(id));
export const deleteSaved = (id) => tx('stories', 'readwrite', (st) => st.delete(id));    // Delete
export const queueStory = (item) => tx('outbox', 'readwrite', (st) => st.add(item));
export const getQueue = () => tx('outbox', 'readonly', (st) => st.getAll());
export const removeQueued = (id) => tx('outbox', 'readwrite', (st) => st.delete(id));