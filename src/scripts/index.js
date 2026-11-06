import '../styles/styles.css';
import App from './pages/app';
import { syncOutbox } from './data/sync';
import { showToast } from './utils';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({ content: document.getElementById('main-content'), authLink: document.getElementById('auth-link'), pushButton: document.getElementById('push-toggle') });
  app.renderPage();
  window.addEventListener('hashchange', () => app.renderPage());
  document.getElementById('skip-link').addEventListener('click', (e) => {
    e.preventDefault();
    const main = document.getElementById('main-content'); main.focus(); main.scrollIntoView();
  });

  // PWA: service worker, tombol pasang, sinkronisasi offline
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  let deferred; const install = document.getElementById('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; install.hidden = false; });
  install.addEventListener('click', async () => { deferred.prompt(); await deferred.userChoice; deferred = null; install.hidden = true; });
  window.addEventListener('appinstalled', () => { install.hidden = true; });
  window.addEventListener('online', () => { showToast('Kembali online.'); syncOutbox(); });
  window.addEventListener('offline', () => showToast('Kamu sedang offline. Status baru akan disimpan dan dikirim nanti.'));
  syncOutbox();
});
