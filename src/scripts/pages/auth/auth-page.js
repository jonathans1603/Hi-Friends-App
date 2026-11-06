import { login, register } from '../../data/api';

class AuthPage {
  constructor(isRegister) { this.isRegister = isRegister; }
  async render() {
    const r = this.isRegister;
    return `<section class="container narrow" aria-labelledby="auth-title">
      <h1 id="auth-title">${r ? 'Daftar akun' : 'Masuk'}</h1>
      <form id="auth-form">
        ${r ? '<div class="field"><label for="name">Nama</label><input id="name" required autocomplete="name" /></div>' : ''}
        <div class="field"><label for="email">Email</label><input id="email" type="email" required autocomplete="email" /></div>
        <div class="field"><label for="password">Kata sandi (min. 8 karakter)</label><input id="password" type="password" minlength="8" required autocomplete="${r ? 'new-password' : 'current-password'}" /></div>
        <button class="btn" type="submit">${r ? 'Daftar' : 'Masuk'}</button>
        <p id="auth-status" class="status" role="status" aria-live="polite"></p>
      </form>
      <p>${r ? 'Sudah punya akun? <a href="#/login">Masuk</a>' : 'Belum punya akun? <a href="#/register">Daftar</a>'}</p></section>`;
  }
  async afterRender() {
    const status = document.getElementById('auth-status');
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = (id) => document.getElementById(id)?.value.trim();
      try {
        if (this.isRegister) { await register({ name: v('name'), email: v('email'), password: v('password') }); location.hash = '#/login'; }
        else { await login({ email: v('email'), password: v('password') }); location.hash = '#/'; }
      } catch (err) { status.className = 'status error'; status.textContent = err.message; }
    });
  }
}
export class LoginPage extends AuthPage { constructor() { super(false); } }
export class RegisterPage extends AuthPage { constructor() { super(true); } }