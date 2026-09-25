/// <reference types="cypress" />

/**
 * Quiz 3 - Test Automation Reza
 * Materi Hari 16: cy.intercept() - Intercepting Network Requests
 *
 * File ini fokus menguji perilaku JARINGAN (network) pada fitur Login,
 * bukan sekadar UI seperti file login.cy.js sebelumnya. Setiap test case
 * di bawah ini memakai cy.intercept() dengan URL dan/atau jenis validasi
 * yang BERBEDA satu sama lain, sesuai instruksi tugas.
 *
 * CATATAN PENTING (baca sebelum run):
 * TC-INTERCEPT-07 mengasumsikan setelah login sukses, Dashboard memanggil
 * API dengan pola URL '**\/api/v2/dashboard/**'. Kalau di komputer Anda
 * ternyata test ini gagal/timeout, buka DevTools (F12) -> tab Network saat
 * login sukses, cari request bertipe XHR/Fetch yang muncul setelah masuk
 * Dashboard, lalu sesuaikan pola URL pada baris intercept TC-INTERCEPT-07.
 */

describe('Modul Login - Network Intercept (cy.intercept)', () => {
  const LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  const selectors = {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    invalidCredentialAlert: '.oxd-alert-content-text',
    forgotPasswordLink: '.orangehrm-login-forgot-header',
  };

  const validUser = { username: 'Admin', password: 'admin123' };
  const wrongPasswordUser = { username: 'Admin', password: 'salahpassword' };

  // ============================================================
  // TC-INTERCEPT-01
  // URL: POST **/auth/login
  // Validasi: request BODY berisi username & password yang benar
  // ============================================================
  it('TC-INTERCEPT-01 | Request body login berisi username & password yang benar-benar dikirim', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.visit(LOGIN_URL);
    cy.get(selectors.usernameInput).type(validUser.username);
    cy.get(selectors.passwordInput).type(validUser.password);
    cy.get(selectors.loginButton).click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.include(`username=${validUser.username}`);
      expect(interception.request.body).to.include(`password=${validUser.password}`);
    });
  });

  // ============================================================
  // TC-INTERCEPT-02
  // URL: POST **/auth/login (sama seperti di atas)
  // Validasi BERBEDA: status code response harus 2xx atau 3xx (sukses)
  // ============================================================
  it('TC-INTERCEPT-02 | Status code response login valid harus sukses (2xx/3xx)', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.visit(LOGIN_URL);
    cy.get(selectors.usernameInput).type(validUser.username);
    cy.get(selectors.passwordInput).type(validUser.password);
    cy.get(selectors.loginButton).click();

    cy.wait('@loginRequest').its('response.statusCode').should('be.within', 200, 399);
    cy.url().should('include', '/dashboard/index');
  });

  // ============================================================
  // TC-INTERCEPT-03
  // URL: POST **/auth/login (sama)
  // Validasi BERBEDA: kredensial salah tetap mengirim request ke server
  // (membuktikan validasi Invalid Credentials terjadi di server, bukan cuma client)
  // ============================================================
  it('TC-INTERCEPT-03 | Request login tetap terkirim ke server meski kredensial salah', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.visit(LOGIN_URL);
    cy.get(selectors.usernameInput).type(wrongPasswordUser.username);
    cy.get(selectors.passwordInput).type(wrongPasswordUser.password);
    cy.get(selectors.loginButton).click();

    cy.wait('@loginRequest').its('response.statusCode').should('be.within', 200, 399);
    cy.get(selectors.invalidCredentialAlert).should('be.visible').and('contain.text', 'Invalid credentials');
  });

  // ============================================================
  // TC-INTERCEPT-04
  // URL: POST **/auth/login (sama)
  // Validasi BERBEDA: STUB paksa response error (500), pastikan aplikasi
  // tidak berhasil redirect ke Dashboard saat server bermasalah
  // ============================================================
  it('TC-INTERCEPT-04 | Aplikasi tidak redirect ke Dashboard saat server merespons error (stub 500)', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 500,
      body: 'Internal Server Error',
    }).as('loginServerError');

    cy.visit(LOGIN_URL);
    cy.get(selectors.usernameInput).type(validUser.username);
    cy.get(selectors.passwordInput).type(validUser.password);
    cy.get(selectors.loginButton).click();

    cy.wait('@loginServerError');
    cy.url().should('include', '/auth/login');
    cy.url().should('not.include', '/dashboard/index');
  });

  // ============================================================
  // TC-INTERCEPT-05
  // URL: POST **/auth/login (sama)
  // Validasi BERBEDA: gunakan delay buatan, pastikan Cypress bisa
  // menunggu (cy.wait) response yang lambat sampai benar-benar selesai
  // ============================================================
  it('TC-INTERCEPT-05 | Login tetap berhasil meski response server diperlambat (delay 3 detik)', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      req.continue((res) => {
        res.setDelay(3000);
      });
    }).as('slowLoginRequest');

    cy.visit(LOGIN_URL);
    cy.get(selectors.usernameInput).type(validUser.username);
    cy.get(selectors.passwordInput).type(validUser.password);
    cy.get(selectors.loginButton).click();

    cy.wait('@slowLoginRequest', { timeout: 15000 });
    cy.url({ timeout: 15000 }).should('include', '/dashboard/index');
  });

  // ============================================================
  // TC-INTERCEPT-06
  // URL BERBEDA: GET **/auth/login (saat halaman Login pertama kali dimuat)
  // Validasi: halaman Login berhasil dimuat dengan status 200
  // ============================================================
  it('TC-INTERCEPT-06 | Halaman Login berhasil dimuat pertama kali dengan status 200', () => {
    cy.intercept('GET', '**/auth/login').as('getLoginPage');

    cy.visit(LOGIN_URL);

    cy.wait('@getLoginPage').its('response.statusCode').should('eq', 200);
    cy.get(selectors.usernameInput).should('be.visible');
  });

  // ============================================================
  // TC-INTERCEPT-07
  // URL BERBEDA: GET **/requestPasswordResetCode (saat klik "Forgot your password?")
  // Validasi: request halaman Reset Password berhasil dipanggil
  // ============================================================
  it('TC-INTERCEPT-07 | Klik "Forgot your password?" memanggil halaman Reset Password dengan sukses', () => {
    cy.intercept('GET', '**/requestPasswordResetCode').as('getResetPasswordPage');

    cy.visit(LOGIN_URL);
    cy.get(selectors.forgotPasswordLink).click();

    cy.wait('@getResetPasswordPage').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/requestPasswordResetCode');
  });

  // ============================================================
  // TC-INTERCEPT-08
  // URL: POST **/auth/login (sama seperti awal)
  // Validasi PALING BERBEDA: memastikan TIDAK ADA request terkirim ke
  // server saat Username & Password kosong (validasi berhenti di client-side)
  // ============================================================
  it('TC-INTERCEPT-08 | Tidak ada request terkirim ke server saat form kosong (validasi client-side)', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.visit(LOGIN_URL);
    cy.get(selectors.loginButton).click();

    // Beri jeda singkat untuk memastikan tidak ada request yang menyusul terkirim
    cy.wait(1000);
    cy.get('@loginRequest.all').should('have.length', 0);
    cy.url().should('include', '/auth/login');
  });
});
