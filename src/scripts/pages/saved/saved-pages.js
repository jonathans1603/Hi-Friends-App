import SavedPresenter from './saved-presenter';
import { esc, formatDate } from '../../utils';

export default class SavedPage {
  #p;
  async render() {
    return `<section class="container" aria-labelledby="saved-title">
      <h1 id="saved-title">Teman tersimpan</h1>
      <div class="row toolbar">
        <div><label for="q">Cari nama atau cerita</label><input id="q" type="search" /></div>
        <div><label for="sort">Urutkan</label><select id="sort"><option value="new">Terbaru</option><option value="old">Terlama</option><option value="name">Nama A–Z</option></select></div>
      </div>
      <h2>Menunggu dikirim</h2>
      <ul id="outbox" class="list" aria-live="polite"></ul>
      <p><button type="button" id="sync-now" class="btn alt">Kirim sekarang</button></p>
      <h2>Tersimpan di perangkat</h2>
      <ul id="saved" class="list" aria-live="polite"></ul></section>`;
  }
  async afterRender() {
    this.#p = new SavedPresenter({ view: this });
    const q = document.getElementById('q'); const sort = document.getElementById('sort');
    const go = () => this.#p.load(q.value, sort.value);
    q.addEventListener('input', go); sort.addEventListener('change', go);
    document.getElementById('sync-now').addEventListener('click', async () => { await this.#p.sync(); go(); });
    document.getElementById('saved').addEventListener('click', (e) => {
      const b = e.target.closest('.del'); if (b) this.#p.remove(b.dataset.id, q.value, sort.value);
    });
    go();
  }
  showSaved(items) {
    document.getElementById('saved').innerHTML = items.length ? items.map((s) => `<li class="saved-item">
      <img src="${esc(s.photoUrl)}" alt="Foto status dari ${esc(s.name)}" loading="lazy" />
      <div class="card-body"><strong>${esc(s.name)}</strong><span>${esc(s.description)}</span><small>${formatDate(s.createdAt)}</small>
      <span class="row"><a class="btn small" href="#/story/${encodeURIComponent(s.id)}">Detail</a>
      <button type="button" class="btn alt small del" data-id="${esc(s.id)}" aria-label="Hapus status dari ${esc(s.name)}">Hapus</button></span></div></li>`).join('')
      : '<li class="note">Tidak ada status tersimpan. Tekan “Simpan” di beranda untuk menyimpan.</li>';
  }
  showOutbox(items) {
    document.getElementById('outbox').innerHTML = items.length
      ? items.map((i) => `<li class="note">${esc(i.description)} <small>(menunggu koneksi)</small></li>`).join('')
      : '<li class="note">Tidak ada status yang menunggu.</li>';
  }
}
