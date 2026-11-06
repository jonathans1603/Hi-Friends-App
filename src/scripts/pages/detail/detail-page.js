import { getStories, getStoryDetail } from '../../data/api';
import { getSavedOne, saveStory } from '../../data/idb';
import { createMap, L, esc, formatDate, showToast } from '../../utils';

export default class DetailPage {
  #id; #map;
  constructor(id) { this.#id = id; }
  async render() {
    return `<section class="container narrow" aria-labelledby="d-title"><h1 id="d-title">Detail status</h1>
      <div id="detail" aria-live="polite">Memuat…</div></section>`;
  }
  async #load() {
    try {
      return this.#id === 'latest' ? (await getStories()).listStory[0] : (await getStoryDetail(this.#id)).story;
    } catch (e) {
      const saved = e.network && (await getSavedOne(this.#id)); // fallback offline dari IndexedDB
      if (saved) return saved; throw e;
    }
  }
  async afterRender() {
    const box = document.getElementById('detail');
    try {
      const s = await this.#load();
      if (!s) { box.innerHTML = '<p class="note">Status tidak ditemukan.</p>'; return; }
      box.innerHTML = `<article><img class="preview" src="${esc(s.photoUrl)}" alt="Foto status dari ${esc(s.name)}" />
        <h2>${esc(s.name)}</h2><p>${esc(s.description)}</p><p><small>${formatDate(s.createdAt)}</small></p>
        ${s.lat != null ? '<div id="dmap" class="map small" role="region" aria-label="Lokasi status"></div>' : ''}
        <p class="row"><button type="button" id="save" class="btn">Simpan</button><a class="btn alt" href="#/">Kembali</a></p></article>`;
      document.getElementById('save').addEventListener('click', async () => { await saveStory(s); showToast('Status disimpan ke perangkat.'); });
      if (s.lat != null) {
        this.#map = createMap(document.getElementById('dmap'), [s.lat, s.lon], 13);
        L.marker([s.lat, s.lon]).addTo(this.#map);
      }
    } catch (e) { box.innerHTML = `<p class="note error" role="alert">${esc(e.message)}</p>`; }
  }
  destroy() { this.#map?.remove(); }
}