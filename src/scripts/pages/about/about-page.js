export default class AboutPage {
  async render() {
    return `<section class="container narrow" aria-labelledby="about-title">
      <h1 id="about-title">Tentang Hi-Friends</h1>
      <p>Hi-Friends membantu kamu bertemu teman baru. Pasang status singkat dengan foto dan lokasi, lalu lihat siapa saja yang menyapa dari sekitarmu di peta.</p>
      <p><a class="btn" href="#/add">Pasang status pertamamu</a></p>
    </section>`;
  }
  async afterRender() {}
}
