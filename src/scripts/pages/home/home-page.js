import HomePresenter from './home-presenter';
import { createMap, L, esc, formatDate, showToast } from '../../utils';
import { saveStory } from '../../data/idb';

export default class HomePage {
  #map; #markers = new Map();
  async render() {
    return `<section class="container" aria-labelledby="home-title">
      <h1 id="home-title">Status teman terbaru</h1>
      <div class="home-grid">
        <div id="map" class="map" role="region" aria-label="Peta lokasi status teman"></div>
        <ul id="list" class="list" aria-live="polite"><li class="note">Memuat status…</li></ul>
      </div></section>`;
  }
  async afterRender() {
    this.#map = createMap(document.getElementById('map'));
    new HomePresenter({ view: this }).init();
  }
  destroy() { this.#map?.remove(); }

  showLoginNeeded() {
    document.getElementById('list').innerHTML = '<li class="note">Masuk dulu untuk melihat status teman. <a href="#/login">Masuk</a> atau <a href="#/register">Daftar</a>.</li>';
  }
  showError(msg) { document.getElementById('list').innerHTML = `<li class="note error" role="alert">${esc(msg)}</li>`; }

  showStories(stories) {
    const list = document.getElementById('list');
    if (!stories.length) { list.innerHTML = '<li class="note">Belum ada status. <a href="#/add">Pasang yang pertama!</a></li>'; return; }
    list.innerHTML = stories.map((s) => `<li><button type="button" class="card" data-id="${esc(s.id)}">
        <img src="${esc(s.photoUrl)}" alt="Foto status dari ${esc(s.name)}" loading="lazy" />
        <span class="card-body"><strong>${esc(s.name)}</strong><span>${esc(s.description)}</span><small>${formatDate(s.createdAt)}</small></span>
      </button><button type="button" class="btn alt small save" data-id="${esc(s.id)}">Simpan</button></li>`).join('');
    list.querySelectorAll('.save').forEach((b) => b.addEventListener('click', async () => {
      await saveStory(stories.find((s) => s.id === b.dataset.id)); b.textContent = 'Tersimpan ✓'; showToast('Status disimpan ke perangkat.');
    }));
    const bounds = [];
    stories.filter((s) => s.lat != null && s.lon != null).forEach((s) => {
      const m = L.marker([s.lat, s.lon]).addTo(this.#map)
        .bindPopup(`<img class="popup-img" src="${esc(s.photoUrl)}" alt="Foto status dari ${esc(s.name)}" /><strong>${esc(s.name)}</strong><br>${esc(s.description)}`);
      m.on('click', () => this.#highlight(s.id, false));
      this.#markers.set(s.id, m); bounds.push([s.lat, s.lon]);
    });
    if (bounds.length) this.#map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    list.querySelectorAll('.card').forEach((b) => b.addEventListener('click', () => this.#highlight(b.dataset.id, true)));
  }

  #highlight(id, fly) {
    document.querySelectorAll('.card').forEach((c) => c.classList.toggle('active', c.dataset.id === id));
    const card = document.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
    if (!fly) card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const m = this.#markers.get(id);
    if (fly && m) { this.#map.flyTo(m.getLatLng(), 12); m.openPopup(); }
  }
}
