/**
 * Final Project - Test Automation Reza
 * Page Object: Login (action + assertion + intercept)
 */
class LoginPage {
  url = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

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

  // ---------------- ACTION ----------------
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

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click();
    return this;
  }

  login(username, password) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
    return this;
  }

  // ---------------- INTERCEPT ----------------
  interceptLoginPageLoad() {
    cy.intercept('GET', '**/auth/login').as('loginPageLoad');
    return this;
  }

  interceptLoginRequest() {
    cy.intercept('POST', '**/auth/validate').as('loginRequest');
    return this;
  }

  interceptLoginRequestWithError(statusCode = 500) {
    cy.intercept('POST', '**/auth/validate', { statusCode, body: 'Internal Server Error' }).as('loginRequest');
    return this;
  }

  interceptLoginRequestWithDelay(delayMs = 3000) {
    cy.intercept('POST', '**/auth/validate', (req) => {
      req.continue((res) => res.setDelay(delayMs));
    }).as('loginRequest');
    return this;
  }

  interceptForgotPasswordRequest() {
    cy.intercept('GET', '**/requestPasswordResetCode').as('forgotPasswordRequest');
    return this;
  }

  // ---------------- ASSERTION ----------------
  verifyLoginSuccess() {
    cy.url().should('include', '/dashboard/index');
    this.elements.dashboardHeader().should('be.visible').and('contain.text', 'Dashboard');
    return this;
  }

  verifyInvalidCredentials() {
    this.elements.invalidCredentialAlert().should('be.visible').and('contain.text', 'Invalid credentials');
    return this;
  }

  verifyRequiredError(fieldName) {
    this.elements.fieldErrorMessage(fieldName).should('be.visible').and('contain.text', 'Required');
    return this;
  }

  verifyStillOnLoginPage() {
    // OrangeHRM memproses form login di URL '/auth/validate' (bukan redirect
    // balik ke '/auth/login'), jadi yang penting divalidasi adalah TIDAK
    // berhasil masuk ke dashboard - bukan URL persisnya.
    cy.url().should('not.include', '/dashboard');
    return this;
  }

  verifyOnResetPasswordPage() {
    cy.url().should('include', '/requestPasswordResetCode');
    this.elements.resetPasswordHeader().should('be.visible');
    return this;
  }
}

export default new LoginPage();
