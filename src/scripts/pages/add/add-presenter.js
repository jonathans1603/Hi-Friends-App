import { addStory } from '../../data/api';
import { queueStory } from '../../data/idb';

export default class AddPresenter {
  #view;
  constructor({ view }) { this.#view = view; }
  async submit({ description, photo, lat, lon }) {
    const errors = {};
    if (!description.trim()) errors.description = 'Cerita tidak boleh kosong.';
    if (!photo) errors.photo = 'Pilih foto atau ambil dari kamera.';
    else if (photo.size > 1024 * 1024) errors.photo = 'Ukuran foto maksimal 1 MB.';
    if (lat == null) errors.location = 'Klik peta untuk memilih lokasi.';
    if (Object.keys(errors).length) { this.#view.showErrors(errors); return; }
    this.#view.setBusy(true);
    try {
      const fd = new FormData();
      fd.append('description', description.trim()); fd.append('photo', photo); fd.append('lat', lat); fd.append('lon', lon);
      await addStory(fd);
      this.#view.showSuccess('Status berhasil dipasang! Mengalihkan ke beranda…');
      setTimeout(() => { location.hash = '#/'; }, 1200);
    } catch (e) {
      if (e.network) { // offline: simpan ke IndexedDB, dikirim otomatis saat online
        await queueStory({ description: description.trim(), photo, lat, lon, createdAt: Date.now() });
        this.#view.showSuccess('Kamu sedang offline. Status disimpan dan akan dikirim otomatis saat online.');
        setTimeout(() => { location.hash = '#/saved'; }, 1800);
      } else this.#view.showFailure(`Gagal memasang status: ${e.message}`);
    } finally { this.#view.setBusy(false); }
  }
}