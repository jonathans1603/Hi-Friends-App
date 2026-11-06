import { addStory } from './api';
import { getQueue, removeQueued } from './idb';
import { showToast } from '../utils';

let busy = false;
export async function syncOutbox() {
  if (busy || !navigator.onLine) return 0;
  busy = true; let sent = 0;
  try {
    for (const it of await getQueue()) {
      const fd = new FormData();
      fd.append('description', it.description); fd.append('photo', it.photo, it.photo.name || 'foto.jpg');
      fd.append('lat', it.lat); fd.append('lon', it.lon);
      try { await addStory(fd); await removeQueued(it.id); sent++; } catch { break; }
    }
  } finally { busy = false; }
  if (sent) showToast(`${sent} status offline berhasil dikirim.`);
  return sent;
}