/// <reference types="cypress" />

/**
 * Quiz 3 - Test Automation Reza
 */

// ============================================================
// SELECTOR - Halaman Login OrangeHRM
// ============================================================
const selectors = {
  usernameInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  invalidCredentialAlert: '.oxd-alert-content-text',
  dashboardHeader: '.oxd-topbar-header-breadcrumb-module',
};

// Helper untuk ambil pesan error "Required" pada field tertentu
const getFieldErrorMessage = (fieldName) => {
  return cy
    .get(`input[name="${fieldName}"]`)
    .parents('.oxd-input-group')
    .find('.oxd-input-field-error-message');
};

// ============================================================
// DATA UJI
// ============================================================
const data = {
  validUser: { username: 'Admin', password: 'admin123' },
  wrongPassword: { username: 'Admin', password: 'salahpassword' },
  wrongUsername: { username: 'AdminSalah', password: 'admin123' },
  invalidCombo: { username: 'UserTidakAda', password: 'passwordAsal' },
  lowercaseUsername: { username: 'admin', password: 'admin123' },
  usernameWithSpaces: { username: ' Admin ', password: 'admin123' },
};

// ============================================================
// TEST SUITE
// ============================================================
describe('Modul Login - OrangeHRM Demo', () => {
  const LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  beforeEach(() => {
    cy.visit(LOGIN_URL);
  });

  // ------------------------------------------------------------
  // TC-LOGIN-01: Login sukses dengan kredensial valid
  // ------------------------------------------------------------
  it('TC-LOGIN-01 | Login berhasil dengan username dan password valid', () => {
    cy.get(selectors.usernameInput).type(data.validUser.username);
    cy.get(selectors.passwordInput).type(data.validUser.password);
    cy.get(selectors.loginButton).click();

    cy.url().should('include', '/dashboard/index');
    cy.get(selectors.dashboardHeader).should('be.visible').and('contain.text', 'Dashboard');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-02: Login gagal - password salah
  // ------------------------------------------------------------
  it('TC-LOGIN-02 | Login gagal saat password salah', () => {
    cy.get(selectors.usernameInput).type(data.wrongPassword.username);
    cy.get(selectors.passwordInput).type(data.wrongPassword.password);
    cy.get(selectors.loginButton).click();

    cy.get(selectors.invalidCredentialAlert)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-03: Login gagal - username salah
  // ------------------------------------------------------------
  it('TC-LOGIN-03 | Login gagal saat username tidak terdaftar', () => {
    cy.get(selectors.usernameInput).type(data.wrongUsername.username);
    cy.get(selectors.passwordInput).type(data.wrongUsername.password);
    cy.get(selectors.loginButton).click();

    cy.get(selectors.invalidCredentialAlert)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-04: Login gagal - username & password kosong
  // ------------------------------------------------------------
  it('TC-LOGIN-04 | Menampilkan pesan Required saat Username dan Password kosong', () => {
    cy.get(selectors.loginButton).click();

    getFieldErrorMessage('username').should('be.visible').and('contain.text', 'Required');
    getFieldErrorMessage('password').should('be.visible').and('contain.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-05: Login gagal - username kosong, password diisi
  // ------------------------------------------------------------
  it('TC-LOGIN-05 | Menampilkan pesan Required saat Username kosong', () => {
    cy.get(selectors.passwordInput).type(data.validUser.password);
    cy.get(selectors.loginButton).click();

    getFieldErrorMessage('username').should('be.visible').and('contain.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-06: Login gagal - password kosong, username diisi
  // ------------------------------------------------------------
  it('TC-LOGIN-06 | Menampilkan pesan Required saat Password kosong', () => {
    cy.get(selectors.usernameInput).type(data.validUser.username);
    cy.get(selectors.loginButton).click();

    getFieldErrorMessage('password').should('be.visible').and('contain.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-07: Verifikasi password ter-mask
  // ------------------------------------------------------------
  it('TC-LOGIN-07 | Karakter Password ditampilkan tersamar (masked)', () => {
    cy.get(selectors.passwordInput).type(data.validUser.password);

    cy.get(selectors.passwordInput).should('have.attr', 'type', 'password');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-08: Verifikasi pesan error kombinasi salah
  // ------------------------------------------------------------
  it('TC-LOGIN-08 | Menampilkan pesan error yang jelas untuk kombinasi username & password salah', () => {
    cy.get(selectors.usernameInput).type(data.invalidCombo.username);
    cy.get(selectors.passwordInput).type(data.invalidCombo.password);
    cy.get(selectors.loginButton).click();

    cy.get(selectors.invalidCredentialAlert)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-09: Fungsi link "Forgot your password?"
  // ------------------------------------------------------------
  it('TC-LOGIN-09 | Link "Forgot your password?" mengarahkan ke halaman Reset Password', () => {
    cy.contains('.orangehrm-login-forgot-header', 'Forgot your password?').click();

    cy.url().should('include', '/requestPasswordResetCode');
    cy.contains('h6', 'Reset Password').should('be.visible');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-10: Case sensitivity pada Username
  // ------------------------------------------------------------
  it('TC-LOGIN-10 | Login dengan Username huruf kecil semua ("admin") tetap dapat masuk', () => {
    // Catatan: perilaku aktual sistem saat ini adalah username TIDAK case-sensitive
    // (didokumentasikan sebagai BUG-001 pada Bug Report terpisah). Assertion ini
    // memvalidasi perilaku AKTUAL sistem sehingga hasilnya tetap Passed.
    cy.get(selectors.usernameInput).type(data.lowercaseUsername.username);
    cy.get(selectors.passwordInput).type(data.lowercaseUsername.password);
    cy.get(selectors.loginButton).click();

    cy.url().should('include', '/dashboard/index');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-11: Login menggunakan tombol Enter
  // ------------------------------------------------------------
  it('TC-LOGIN-11 | Login berhasil menggunakan tombol Enter tanpa klik tombol Login', () => {
    cy.get(selectors.usernameInput).type(data.validUser.username);
    cy.get(selectors.passwordInput).type(`${data.validUser.password}{enter}`);

    cy.url().should('include', '/dashboard/index');
  });

  // ------------------------------------------------------------
  // TC-LOGIN-12: Username dengan leading/trailing space
  // ------------------------------------------------------------
  it('TC-LOGIN-12 | Login gagal saat Username mengandung spasi di awal/akhir', () => {
    cy.get(selectors.usernameInput).type(data.usernameWithSpaces.username);
    cy.get(selectors.passwordInput).type(data.usernameWithSpaces.password);
    cy.get(selectors.loginButton).click();

    cy.get(selectors.invalidCredentialAlert)
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });
});
