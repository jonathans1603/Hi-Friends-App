import AddPresenter from './add-presenter';
import { createMap, L } from '../../utils';

export default class AddPage {
  #map; #marker; #stream = null; #photo = null; #lat = null; #lon = null;
  async render() {
    return `<section class="container narrow" aria-labelledby="add-title">
      <h1 id="add-title">Pasang status baru</h1>
      <form id="form" novalidate>
        <div class="field"><label for="description">Ceritamu</label>
          <textarea id="description" rows="4" required aria-describedby="err-description"></textarea>
          <p class="field-error" id="err-description" role="alert"></p></div>
        <div class="field"><label for="photo">Foto (maks. 1 MB)</label>
          <input id="photo" type="file" accept="image/*" aria-describedby="err-photo" />
          <div class="row"><button type="button" id="cam-open" class="btn alt">Buka kamera</button>
            <button type="button" id="cam-shot" class="btn" hidden>Ambil foto</button>
            <button type="button" id="cam-close" class="btn alt" hidden>Tutup kamera</button></div>
          <video id="video" class="preview" autoplay playsinline muted hidden aria-label="Pratinjau kamera"></video>
          <img id="preview" class="preview" alt="Pratinjau foto yang dipilih" hidden />
          <p class="field-error" id="err-photo" role="alert"></p></div>
        <div class="field"><p id="map-label">Lokasi (klik peta untuk memilih)</p>
          <div id="pick-map" class="map small" role="region" aria-labelledby="map-label"></div>
          <div class="row"><div><label for="lat">Latitude</label><input id="lat" readonly /></div>
            <div><label for="lon">Longitude</label><input id="lon" readonly /></div></div>
          <p class="field-error" id="err-location" role="alert"></p></div>
        <button type="submit" id="submit" class="btn">Pasang status</button>
        <p id="status" class="status" role="status" aria-live="polite"></p>
      </form></section>`;
  }

  async afterRender() {
    const presenter = new AddPresenter({ view: this });
    const $ = (id) => document.getElementById(id);
    this.#map = createMap($('pick-map'));
    this.#map.on('click', (e) => {
      this.#lat = e.latlng.lat; this.#lon = e.latlng.lng;
      $('lat').value = this.#lat.toFixed(6); $('lon').value = this.#lon.toFixed(6);
      this.#marker ? this.#marker.setLatLng(e.latlng) : (this.#marker = L.marker(e.latlng).addTo(this.#map));
    });
    $('photo').addEventListener('change', (e) => this.#setPhoto(e.target.files[0]));
    $('cam-open').addEventListener('click', async () => {
      try {
        this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
        $('video').srcObject = this.#stream;
        ['video', 'cam-shot', 'cam-close'].forEach((i) => ($(i).hidden = false));
      } catch { this.showFailure('Kamera tidak dapat diakses. Periksa izin kamera.'); }
    });
    $('cam-shot').addEventListener('click', () => {
      const v = $('video'); const c = document.createElement('canvas');
      c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
      c.toBlob((b) => { this.#setPhoto(new File([b], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' })); this.#stopCamera(); }, 'image/jpeg', 0.8);
    });
    $('cam-close').addEventListener('click', () => this.#stopCamera());
    $('form').addEventListener('submit', (e) => {
      e.preventDefault();
      presenter.submit({ description: $('description').value, photo: this.#photo, lat: this.#lat, lon: this.#lon });
    });
  }

  #setPhoto(file) {
    this.#photo = file || null;
    const img = document.getElementById('preview');
    if (file) { img.src = URL.createObjectURL(file); img.hidden = false; } else img.hidden = true;
  }
  #stopCamera() {
    this.#stream?.getTracks().forEach((t) => t.stop()); this.#stream = null;
    const v = document.getElementById('video'); if (v) v.srcObject = null;
    ['video', 'cam-shot', 'cam-close'].forEach((i) => { const el = document.getElementById(i); if (el) el.hidden = true; });
  }
  destroy() { this.#stopCamera(); this.#map?.remove(); } // stream ditutup saat pindah halaman

  showErrors(errs) {
    ['description', 'photo', 'location'].forEach((k) => { document.getElementById(`err-${k}`).textContent = errs[k] || ''; });
    if (Object.keys(errs).length) this.#status('Periksa kembali isian yang ditandai.', 'error');
  }
  #status(msg, type) { const s = document.getElementById('status'); s.textContent = msg; s.className = `status ${type}`; }
  showSuccess(msg) { this.showErrors({}); this.#status(msg, 'ok'); }
  showFailure(msg) { this.#status(msg, 'error'); }
  setBusy(b) { const s = document.getElementById('submit'); s.disabled = b; s.textContent = b ? 'Mengirim…' : 'Pasang status'; }
}
