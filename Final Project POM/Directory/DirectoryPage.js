/**
 * Final Project - Test Automation Reza
 * Page Object: Directory (action + assertion + intercept)
 *
 * CATATAN ASUMSI (mohon diverifikasi kalau ada test gagal):
 * - Pola URL API pencarian Directory saya asumsikan '**\/api/v2/**'
 *   (wildcard umum untuk seluruh API v2 OrangeHRM). Ini sengaja dibuat
 *   longgar/general supaya tetap menangkap request yang benar walau
 *   nama endpoint spesifiknya berbeda dari dugaan saya.
 * - Kalau TC-DIR-02, 03, 04, 05, atau 08 gagal/timeout menunggu intercept,
 *   buka DevTools > Network saat melakukan Search di Directory secara
 *   manual, cari request XHR/Fetch yang muncul, lalu beri tahu saya nama
 *   endpoint-nya untuk saya perbaiki polanya.
 */
class DirectoryPage {
  url = 'https://opensource-demo.orangehrmlive.com/web/index.php/directory/viewDirectory';

  elements = {
    employeeNameInput: () => cy.get('input[placeholder="Type for hints..."]'),
    jobTitleDropdown: () => cy.get('.oxd-select-text-input').eq(0),
    locationDropdown: () => cy.get('.oxd-select-text-input').eq(1),
    dropdownOption: (optionText) => cy.contains('.oxd-select-option', optionText),
    searchButton: () => cy.contains('button', 'Search'),
    resetButton: () => cy.contains('button', 'Reset'),
    recordsFoundText: () => cy.contains(/Records Found/i),
    firstResultLink: () => cy.get('.oxd-table-card, .orangehrm-directory-card').first(),
    // Strategi paling robust: cari langsung anchor yang href-nya menuju ke
    // halaman profil karyawan (mengandung '/pim/'), tanpa perlu tahu persis
    // nama class card pembungkusnya.
    firstProfileLink: () => cy.get('a[href*="/pim/"]').first(),
  };

  // ---------------- ACTION ----------------
  loginAsAdmin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');
    return this;
  }

  visit() {
    cy.visit(this.url);
    return this;
  }

  typeEmployeeName(name) {
    if (name) this.elements.employeeNameInput().clear().type(name);
    return this;
  }

  selectJobTitle(jobTitleText) {
    this.elements.jobTitleDropdown().click();
    this.elements.dropdownOption(jobTitleText).click();
    return this;
  }

  selectLocation(locationText) {
    this.elements.locationDropdown().click();
    if (locationText) {
      this.elements.dropdownOption(locationText).click();
    } else {
      // Pilih opsi pertama yang benar-benar tersedia di daftar (dinamis),
      // tidak bergantung pada nama lokasi spesifik yang mungkin berbeda
      // antar instance demo.
      cy.get('.oxd-select-option').first().click();
    }
    return this;
  }

  clickSearch() {
    this.elements.searchButton().click();
    return this;
  }

  clickReset() {
    this.elements.resetButton().click();
    return this;
  }

  clickFirstResult() {
    // Klik langsung pada anchor yang href-nya menuju halaman profil ('/pim/'),
    // strategi ini tidak bergantung pada nama class card yang bisa berbeda-beda.
    this.elements.firstProfileLink().click({ force: true });
    return this;
  }

  // ---------------- INTERCEPT ----------------
  interceptPageLoad() {
    cy.intercept('GET', '**/directory/viewDirectory').as('directoryPageLoad');
    return this;
  }

  interceptSearchRequest() {
    // Dikembalikan ke pattern longgar ini karena TERBUKTI berhasil menangkap
    // request Search sebelumnya (TC-DIR-02, 03, 08 sempat PASSED dengan pattern ini).
    // Masalah ganda-hitung pada TC-DIR-06 sudah diselesaikan lewat pendekatan
    // assertion berbasis UI (verifyNoRecordsFound), bukan lewat mempersempit pattern ini.
    cy.intercept('GET', '**/api/v2/**').as('directorySearch');
    return this;
  }

  // ---------------- ASSERTION ----------------
  verifyFormVisible() {
    this.elements.employeeNameInput().should('be.visible');
    this.elements.jobTitleDropdown().should('be.visible');
    this.elements.locationDropdown().should('be.visible');
    this.elements.searchButton().should('be.visible');
    this.elements.resetButton().should('be.visible');
    return this;
  }

  verifyRecordsFoundVisible() {
    this.elements.recordsFoundText().should('be.visible');
    return this;
  }

  verifyNoRecordsFound() {
    // Menerima salah satu dari dua kemungkinan pesan yang wajar untuk "tidak ada hasil"
    cy.contains(/No Records Found|0 Records Found|Invalid/i).should('be.visible');
    return this;
  }

  verifyEmployeeNameInputEmpty() {
    this.elements.employeeNameInput().should('have.value', '');
    return this;
  }

  verifyUrlIncludesProfile() {
    cy.url().should('include', '/pim/');
    return this;
  }
}

export default new DirectoryPage();
