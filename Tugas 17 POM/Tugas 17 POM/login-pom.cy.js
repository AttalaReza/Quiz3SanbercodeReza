/// <reference types="cypress" />

/**
 * Quiz 3 - Test Automation Reza
 * Materi Hari 17: Page Object Model (POM)
 *
 * Seluruh file di folder ini (LoginPage.js, loginData.json, login-pom.cy.js)
 * sengaja diletakkan dalam SATU folder yang sama dan saling di-import
 * menggunakan path relatif './...' - supaya folder ini bisa langsung
 * disalin utuh ke folder cypress/e2e/ project mana pun tanpa error
 * "Module not found" (pelajaran dari kendala import di Quiz 3 sebelumnya).
 *
 * Perhatikan: file test ini TIDAK berisi selector maupun assertion teknis
 * sama sekali - semua itu dibungkus rapi di dalam LoginPage.js (class POM).
 * File ini hanya membaca seperti alur cerita pengujian.
 */

import LoginPage from './LoginPage.js';
import loginData from './loginData.json';

describe('Modul Login - OrangeHRM Demo (Page Object Model)', () => {
  // ------------------------------------------------------------
  // TC-POM-01: Login sukses dengan kredensial valid
  // ------------------------------------------------------------
  it('TC-POM-01 | Login berhasil dengan username dan password valid', () => {
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);
    LoginPage.verifyLoginSuccess();
  });

  // ------------------------------------------------------------
  // TC-POM-02: Login gagal - password salah
  // ------------------------------------------------------------
  it('TC-POM-02 | Login gagal saat password salah', () => {
    LoginPage.login(loginData.wrongPassword.username, loginData.wrongPassword.password);
    LoginPage.verifyInvalidCredentials();
  });

  // ------------------------------------------------------------
  // TC-POM-03: Login gagal - username salah
  // ------------------------------------------------------------
  it('TC-POM-03 | Login gagal saat username tidak terdaftar', () => {
    LoginPage.login(loginData.wrongUsername.username, loginData.wrongUsername.password);
    LoginPage.verifyInvalidCredentials();
  });

  // ------------------------------------------------------------
  // TC-POM-04: Login gagal - username & password kosong
  // ------------------------------------------------------------
  it('TC-POM-04 | Menampilkan pesan Required saat Username dan Password kosong', () => {
    LoginPage.visit().clickLogin();
    LoginPage.verifyRequiredError('username');
    LoginPage.verifyRequiredError('password');
    LoginPage.verifyStillOnLoginPage();
  });

  // ------------------------------------------------------------
  // TC-POM-05: Login gagal - username kosong, password diisi
  // ------------------------------------------------------------
  it('TC-POM-05 | Menampilkan pesan Required saat Username kosong', () => {
    LoginPage.visit().fillPassword(loginData.validUser.password).clickLogin();
    LoginPage.verifyRequiredError('username');
  });

  // ------------------------------------------------------------
  // TC-POM-06: Login gagal - password kosong, username diisi
  // ------------------------------------------------------------
  it('TC-POM-06 | Menampilkan pesan Required saat Password kosong', () => {
    LoginPage.visit().fillUsername(loginData.validUser.username).clickLogin();
    LoginPage.verifyRequiredError('password');
  });

  // ------------------------------------------------------------
  // TC-POM-07: Verifikasi password ter-mask
  // ------------------------------------------------------------
  it('TC-POM-07 | Karakter Password ditampilkan tersamar (masked)', () => {
    LoginPage.visit().fillPassword(loginData.validUser.password);
    LoginPage.verifyPasswordMasked();
  });

  // ------------------------------------------------------------
  // TC-POM-08: Verifikasi pesan error kombinasi salah
  // ------------------------------------------------------------
  it('TC-POM-08 | Menampilkan pesan error yang jelas untuk kombinasi username & password salah', () => {
    LoginPage.login(loginData.invalidCombo.username, loginData.invalidCombo.password);
    LoginPage.verifyInvalidCredentials();
  });

  // ------------------------------------------------------------
  // TC-POM-09: Fungsi link "Forgot your password?"
  // ------------------------------------------------------------
  it('TC-POM-09 | Link "Forgot your password?" mengarahkan ke halaman Reset Password', () => {
    LoginPage.visit().clickForgotPassword();
    LoginPage.verifyOnResetPasswordPage();
  });

  // ------------------------------------------------------------
  // TC-POM-10: Case sensitivity pada Username
  // ------------------------------------------------------------
  it('TC-POM-10 | Login dengan Username huruf kecil semua ("admin") tetap dapat masuk', () => {
    // Catatan: perilaku aktual sistem tidak case-sensitive pada Username
    // (didokumentasikan sebagai BUG-001 pada Bug Report terpisah).
    LoginPage.login(loginData.lowercaseUsername.username, loginData.lowercaseUsername.password);
    LoginPage.verifyLoginSuccess();
  });

  // ------------------------------------------------------------
  // TC-POM-11: Login menggunakan tombol Enter
  // ------------------------------------------------------------
  it('TC-POM-11 | Login berhasil menggunakan tombol Enter tanpa klik tombol Login', () => {
    LoginPage.visit()
      .fillUsername(loginData.validUser.username)
      .fillPassword(loginData.validUser.password)
      .submitWithEnter();
    LoginPage.verifyLoginSuccess();
  });

  // ------------------------------------------------------------
  // TC-POM-12: Username dengan leading/trailing space
  // ------------------------------------------------------------
  it('TC-POM-12 | Login gagal saat Username mengandung spasi di awal/akhir', () => {
    LoginPage.login(loginData.usernameWithSpaces.username, loginData.usernameWithSpaces.password);
    LoginPage.verifyInvalidCredentials();
  });
});
