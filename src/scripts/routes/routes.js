import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-page';
import AboutPage from '../pages/about/about-page';
import SavedPage from '../pages/saved/saved-pages';
import DetailPage from '../pages/detail/detail-page';
import { LoginPage, RegisterPage } from '../pages/auth/auth-page';

const routes = {
  '/': () => new HomePage(),
  '/add': () => new AddPage(),
  '/saved': () => new SavedPage(),
  '/story/:id': (id) => new DetailPage(id),
  '/about': () => new AboutPage(),
  '/login': () => new LoginPage(),
  '/register': () => new RegisterPage(),
};
export default routes;
