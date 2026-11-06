import { getSaved, deleteSaved, getQueue } from '../../data/idb';
import { syncOutbox } from '../../data/sync';
import { showToast } from '../../utils';

const SORT = {
  new: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  old: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
};
export default class SavedPresenter {
  #view;
  constructor({ view }) { this.#view = view; }
  async load(query = '', sort = 'new') {
    const term = query.trim().toLowerCase();
    const items = (await getSaved()).filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(term)).sort(SORT[sort]);
    this.#view.showSaved(items); this.#view.showOutbox(await getQueue());
  }
  async remove(id, query, sort) { await deleteSaved(id); showToast('Status dihapus dari perangkat.'); await this.load(query, sort); }
  async sync() {
    if (!navigator.onLine) showToast('Masih offline. Akan dikirim otomatis saat online.');
    else if (!(await syncOutbox())) showToast('Tidak ada yang terkirim. Coba lagi nanti.');
  }
}