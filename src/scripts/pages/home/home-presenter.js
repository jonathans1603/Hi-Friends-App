import { getStories, isLoggedIn } from '../../data/api';

export default class HomePresenter {
  #view;
  constructor({ view }) { this.#view = view; }
  async init() {
    if (!isLoggedIn()) { this.#view.showLoginNeeded(); return; }
    try {
      const { listStory } = await getStories();
      this.#view.showStories(listStory);
    } catch (e) { this.#view.showError(e.message); }
  }
}