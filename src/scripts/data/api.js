import { BASE_URL } from '../config';

const token = () => localStorage.getItem('token');
const auth = () => ({ Authorization: `Bearer ${token()}` });
const json = (body, method = 'POST') => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

async function request(path, options = {}) {
  let res;
  try { res = await fetch(`${BASE_URL}${path}`, options); }
  catch {
    const e = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet, matikan VPN atau ad blocker, lalu coba lagi.');
    e.network = true; throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.message || 'Permintaan gagal. Coba lagi.');
  return data;
}

export const register = (d) => request('/register', json(d));
export const login = async (d) => {
  const r = await request('/login', json(d));
  localStorage.setItem('token', r.loginResult.token);
  localStorage.setItem('userName', r.loginResult.name);
  return r;
};
export const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('userName'); window.caches?.delete('hf-data'); };
export const isLoggedIn = () => Boolean(token());
export const getStories = () => request('/stories?location=1&size=50', { headers: auth() });
export const getStoryDetail = (id) => request(`/stories/${encodeURIComponent(id)}`, { headers: auth() });
export const addStory = (fd) => request(isLoggedIn() ? '/stories' : '/stories/guest', { method: 'POST', headers: isLoggedIn() ? auth() : {}, body: fd });
export const pushSubscribe = (sub) => request('/notifications/subscribe', { ...json(sub), headers: { ...auth(), 'Content-Type': 'application/json' } });
export const pushUnsubscribe = (endpoint) => request('/notifications/subscribe', { ...json({ endpoint }, 'DELETE'), headers: { ...auth(), 'Content-Type': 'application/json' } });
