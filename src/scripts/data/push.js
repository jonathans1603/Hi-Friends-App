import { pushSubscribe, pushUnsubscribe, isLoggedIn } from './api';
import { VAPID_PUBLIC_KEY } from '../config';
import { showToast } from '../utils';

const toKey = (s) => { const r = atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const current = async () => (await navigator.serviceWorker.ready).pushManager.getSubscription();

export async function initPushToggle(btn) {
  if (!supported() || !isLoggedIn()) { btn.hidden = true; return; }
  btn.hidden = false;
  const paint = async () => { const on = Boolean(await current()); btn.setAttribute('aria-pressed', String(on)); btn.textContent = `Notifikasi: ${on ? 'Aktif' : 'Mati'}`; };
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      const sub = await current();
      if (sub) { await pushUnsubscribe(sub.endpoint); await sub.unsubscribe(); showToast('Notifikasi dimatikan.'); }
      else {
        if ((await Notification.requestPermission()) !== 'granted') throw new Error('Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.');
        const reg = await navigator.serviceWorker.ready;
        const s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(VAPID_PUBLIC_KEY) });
        const { endpoint, keys } = s.toJSON();
        try { await pushSubscribe({ endpoint, keys }); } catch (err) { await s.unsubscribe(); throw err; }
        showToast('Notifikasi diaktifkan.');
      }
    } catch (e) { showToast(e.message); } finally { btn.disabled = false; paint(); }
  };
  paint();
}