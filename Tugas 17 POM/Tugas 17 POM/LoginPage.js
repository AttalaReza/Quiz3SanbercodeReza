/**
 * Quiz 3 - Test Automation Reza
 * Materi Hari 17: Page Object Model (POM)
 *
 * LoginPage - Page Object Model untuk halaman Login OrangeHRM.
 *
 * Prinsip POM yang diterapkan di sini:
 * 1. Satu Kelas = Satu Halaman  -> class ini fokus mewakili halaman Login saja.
 * 2. Elemen UI dipusatkan di objek `elements`.
 * 3. Metode aksi (fillUsername, clickLogin, dst) membungkus interaksi cy.get()
 *    sehingga file test tidak perlu tahu detail selector sama sekali.
 * 4. Metode validasi (verifyLoginSuccess, verifyInvalidCredentials, dst) juga
 *    disimpan di sini, supaya file test hanya berisi ALUR pengujian, bukan
 *    detail assertion teknis.
 */
class LoginPage {
  // ---------- URL ----------
  url = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  // ---------- Elemen UI (terpusat) ----------
  elements = {
    usernameInput: () => cy.get('input[name="username"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    loginButton: () => cy.get('button[type="submit"]'),
    forgotPasswordLink: () => cy.get('.orangehrm-login-forgot-header'),
    invalidCredentialAlert: () => cy.get('.oxd-alert-content-text'),
    dashboardHeader: () => cy.get('.oxd-topbar-header-breadcrumb-module'),
    resetPasswordHeader: () => cy.contains('h6', 'Reset Password'),
    fieldErrorMessage: (fieldName) =>
      cy.get(`input[name="${fieldName}"]`)
        .parents('.oxd-input-group')
        .find('.oxd-input-field-error-message'),
  };

  // ============================================================
  // METODE AKSI
  // ============================================================
  visit() {
    cy.visit(this.url);
    return this;
  }

  fillUsername(username) {
    if (username) this.elements.usernameInput().clear().type(username);
    return this;
  }

  fillPassword(password) {
    if (password) this.elements.passwordInput().clear().type(password);
    return this;
  }

  clickLogin() {
    this.elements.loginButton().click();
    return this;
  }

  submitWithEnter() {
    this.elements.passwordInput().type('{enter}');
    return this;
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click();
    return this;
  }

  /** Aksi gabungan: buka halaman lalu login sekaligus (dipakai berulang kali di test) */
  login(username, password) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
    return this;
  }

  // ============================================================
  // METODE VALIDASI
  // ============================================================
  verifyLoginSuccess() {
    cy.url().should('include', '/dashboard/index');
    this.elements.dashboardHeader().should('be.visible').and('contain.text', 'Dashboard');
    return this;
  }

  verifyInvalidCredentials() {
    this.elements.invalidCredentialAlert().should('be.visible').and('contain.text', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
    return this;
  }

  verifyRequiredError(fieldName) {
    this.elements.fieldErrorMessage(fieldName).should('be.visible').and('contain.text', 'Required');
    return this;
  }

  verifyPasswordMasked() {
    this.elements.passwordInput().should('have.attr', 'type', 'password');
    return this;
  }

  verifyOnResetPasswordPage() {
    cy.url().should('include', '/requestPasswordResetCode');
    this.elements.resetPasswordHeader().should('be.visible');
    return this;
  }

  verifyStillOnLoginPage() {
    cy.url().should('include', '/auth/login');
    return this;
  }
}

export default new LoginPage();
