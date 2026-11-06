import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CDN = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
L.Icon.Default.mergeOptions({
  iconUrl: `${CDN}marker-icon.png`, iconRetinaUrl: `${CDN}marker-icon-2x.png`, shadowUrl: `${CDN}marker-shadow.png`,
});

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// Peta dengan beberapa tile layer + layer control
export function createMap(el, center = [-2.5, 118], zoom = 5) {
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap' });
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
  const map = L.map(el, { center, zoom, layers: [osm] });
  L.control.layers({ 'Jalan (OSM)': osm, Topografi: topo, Satelit: sat }).addTo(map);
  return map;
}
export { L };

export function showToast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 4500);
}
