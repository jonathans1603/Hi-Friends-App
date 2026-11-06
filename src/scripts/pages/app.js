import routes from '../routes/routes';
import getActiveRoute from '../routes/url-parser';
import { isLoggedIn, logout } from '../data/api';
import { initPushToggle } from '../data/push';

export default class App {
  #content; #authLink; #push; #page = null;
  constructor({ content, authLink, pushButton }) { this.#content = content; this.#authLink = authLink; this.#push = pushButton; }

  #updateChrome() {
    this.#authLink.textContent = isLoggedIn() ? 'Keluar' : 'Masuk';
    this.#authLink.onclick = isLoggedIn() ? () => { logout(); this.#updateChrome(); } : null;
    initPushToggle(this.#push);
  }

  async renderPage() {
    this.#page?.destroy?.();
    const { path, id } = getActiveRoute();
    const factory = routes[path];
    const page = (this.#page = factory ? factory(id) : null);
    const update = async () => {
      this.#content.innerHTML = page
        ? await page.render()
        : '<section class="container"><h1>Halaman tidak ditemukan</h1><p><a href="#/">Kembali ke beranda</a></p></section>';
      await page?.afterRender();
      this.#content.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      this.#updateChrome();
    };
    if (document.startViewTransition) document.startViewTransition(update);
    else await update();
  }
}
