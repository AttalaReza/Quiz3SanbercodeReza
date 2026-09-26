/// <reference types="cypress" />

/**
 * Final Project - Test Automation Reza
 * Modul: Login (8 test case)
 * Menggunakan format POM lengkap: action, assertion, data, dan intercept
 * (semua logic teknis ada di LoginPage.js, file ini hanya alur pengujian)
 */

import LoginPage from './LoginPage.js';
import loginData from './loginData.json';

describe('Final Project - Modul Login (POM + Intercept)', () => {
  beforeEach(() => {
    // Membersihkan cookie & storage sebelum tiap test, supaya sesi login
    // dari test sebelumnya (misal TC-LOGIN-01 yang berhasil login sungguhan)
    // tidak menyebabkan auto-redirect ke Dashboard saat test lain
    // mengunjungi halaman Login.
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('TC-LOGIN-01 | Login sukses, request ke server berstatus sukses (2xx/3xx)', () => {
    LoginPage.interceptLoginRequest();
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);

    cy.wait('@loginRequest').its('response.statusCode').should('be.within', 200, 399);
    LoginPage.verifyLoginSuccess();
  });

  it('TC-LOGIN-02 | Login gagal - password salah, request body terkirim sesuai, muncul Invalid credentials', () => {
    LoginPage.interceptLoginRequest();
    LoginPage.login(loginData.wrongPassword.username, loginData.wrongPassword.password);

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.include(`username=${loginData.wrongPassword.username}`);
    });
    LoginPage.verifyInvalidCredentials();
  });

  it('TC-LOGIN-03 | Tidak ada request terkirim ke server saat form kosong (validasi client-side)', () => {
    LoginPage.interceptLoginRequest();
    LoginPage.visit().clickLogin();

    cy.wait(1000);
    cy.get('@loginRequest.all').should('have.length', 0);
    LoginPage.verifyRequiredError('username');
    LoginPage.verifyRequiredError('password');
  });

  it('TC-LOGIN-04 | Halaman Login berhasil dimuat pertama kali dengan status 200', () => {
    LoginPage.interceptLoginPageLoad();
    LoginPage.visit();

    cy.wait('@loginPageLoad').its('response.statusCode').should('eq', 200);
  });

  it('TC-LOGIN-05 | Saat server merespons error (stub 500), aplikasi tidak redirect ke Dashboard', () => {
    LoginPage.interceptLoginRequestWithError(500);
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);

    cy.wait('@loginRequest');
    LoginPage.verifyStillOnLoginPage();
  });

  it('TC-LOGIN-06 | Klik "Forgot your password?" memanggil halaman Reset Password dengan sukses', () => {
    LoginPage.interceptForgotPasswordRequest();
    LoginPage.visit().clickForgotPassword();

    cy.wait('@forgotPasswordRequest').its('response.statusCode').should('eq', 200);
    LoginPage.verifyOnResetPasswordPage();
  });

  it('TC-LOGIN-07 | Login tetap berhasil meski response server diperlambat (delay 3 detik)', () => {
    LoginPage.interceptLoginRequestWithDelay(3000);
    LoginPage.login(loginData.validUser.username, loginData.validUser.password);

    cy.wait('@loginRequest', { timeout: 15000 });
    LoginPage.verifyLoginSuccess();
  });

  it('TC-LOGIN-08 | Login dengan Username huruf kecil ("admin") tetap berhasil (catatan: BUG-001)', () => {
    // Perilaku aktual sistem tidak case-sensitive pada Username,
    // sudah didokumentasikan sebagai BUG-001 pada Bug Report terpisah.
    LoginPage.interceptLoginRequest();
    LoginPage.login(loginData.lowercaseUsername.username, loginData.lowercaseUsername.password);

    cy.wait('@loginRequest');
    LoginPage.verifyLoginSuccess();
  });
});
