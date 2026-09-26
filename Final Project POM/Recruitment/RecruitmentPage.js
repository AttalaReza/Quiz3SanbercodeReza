/**
 * Final Project - Test Automation Reza
 * Page Object: Recruitment (action + assertion + intercept)
 *
 * CATATAN ASUMSI (mohon diverifikasi kalau ada test gagal):
 * - Pola URL API create candidate/vacancy saya asumsikan
 *   '**\/api/v2/recruitment/**' (wildcard umum). Kalau TC-REC-02, 05, 06,
 *   atau 08 gagal/timeout, cek DevTools > Network saat submit form
 *   Add Candidate / Add Vacancy secara manual, lalu beri tahu saya nama
 *   endpoint yang sebenarnya muncul.
 */
class RecruitmentPage {
  candidatesUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewCandidates';
  vacanciesUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewJobVacancy';

  elements = {
    addButton: () => cy.contains('button', 'Add'),
    firstNameInput: () => cy.get('input[name="firstName"]'),
    lastNameInput: () => cy.get('input[name="lastName"]'),
    // Diganti ke pencarian berdasarkan label, karena field Email dan Vacancy Name
    // kemungkinan tidak memiliki attribute HTML "name" yang sesuai dugaan awal.
    // Kalau masih gagal, cek Inspect Element pada field ini secara manual dan
    // sesuaikan teks label ('Email' / 'Vacancy Name') persis seperti di halaman.
    emailInput: () => cy.contains('label', 'Email').parents('.oxd-input-group').find('input'),
    saveButton: () => cy.contains('button', 'Save'),
    requiredError: () => cy.get('.oxd-input-field-error-message'),
    candidateNameSearchInput: () => cy.get('input[placeholder="Type for hints..."]').first(),
    statusDropdown: () => cy.get('.oxd-select-text-input').eq(3),
    dropdownOption: (optionText) => cy.contains('.oxd-select-option', optionText),
    searchButton: () => cy.contains('button', 'Search'),
    recordsFoundText: () => cy.contains(/Records Found/i),
    vacancyNameInput: () => cy.contains('label', 'Vacancy Name').parents('.oxd-input-group').find('input'),
  };

  // ---------------- ACTION ----------------
  loginAsAdmin() {
    // Bersihkan sesi lama dulu supaya login selalu mulai dari kondisi bersih,
    // menghindari kegagalan redirect akibat sesi "nyangkut" dari test sebelumnya.
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');
    return this;
  }

  visitCandidates() {
    cy.visit(this.candidatesUrl);
    return this;
  }

  visitVacancies() {
    cy.visit(this.vacanciesUrl);
    return this;
  }

  clickAddCandidate() {
    this.elements.addButton().click();
    // Tunggu sampai form Add Candidate benar-benar siap (firstName muncul)
    // sebelum lanjut ke action berikutnya - khusus untuk halaman Candidates.
    this.elements.firstNameInput().should('be.visible');
    return this;
  }

  clickAddVacancy() {
    this.elements.addButton().click();
    // Halaman Add Vacancy tidak punya field firstName - tunggu field
    // Vacancy Name yang muncul di sini, bukan firstName.
    this.elements.vacancyNameInput().should('be.visible');
    return this;
  }

  fillFirstName(value) {
    if (value) this.elements.firstNameInput().clear().type(value);
    return this;
  }

  fillLastName(value) {
    if (value) this.elements.lastNameInput().clear().type(value);
    return this;
  }

  fillEmail(value) {
    if (value) this.elements.emailInput().clear().type(value);
    return this;
  }

  clickSave() {
    this.elements.saveButton().click();
    return this;
  }

  searchCandidateByName(name) {
    this.elements.candidateNameSearchInput().type(name);
    cy.wait(500); // beri waktu dropdown suggestion muncul
    return this;
  }

  clickSearch() {
    this.elements.searchButton().click();
    return this;
  }

  fillVacancyName(name) {
    if (name) this.elements.vacancyNameInput().clear().type(name);
    return this;
  }

  // ---------------- INTERCEPT ----------------
  interceptCandidatesPageLoad() {
    cy.intercept('GET', '**/recruitment/viewCandidates').as('candidatesPageLoad');
    return this;
  }

  interceptSaveCandidateRequest() {
    cy.intercept('POST', '**/api/v2/recruitment/**').as('saveCandidateRequest');
    return this;
  }

  interceptSearchRequest() {
    cy.intercept('GET', '**/api/v2/recruitment/**').as('searchRequest');
    return this;
  }

  interceptVacanciesPageLoad() {
    cy.intercept('GET', '**/recruitment/viewJobVacancy').as('vacanciesPageLoad');
    return this;
  }

  interceptSaveVacancyRequest() {
    // Diperluas mengikuti namespace yang sama dengan candidate (terbukti jalan),
    // karena kemungkinan vacancy juga berada di bawah '/api/v2/recruitment/'.
    cy.intercept('POST', '**/api/v2/recruitment/**').as('saveVacancyRequest');
    return this;
  }

  // ---------------- ASSERTION ----------------
  verifyRequiredErrorVisible() {
    this.elements.requiredError().should('be.visible').and('contain.text', 'Required');
    return this;
  }

  verifyRecordsFoundVisible() {
    this.elements.recordsFoundText().should('be.visible');
    return this;
  }

  verifyAddButtonVisible() {
    this.elements.addButton().should('be.visible');
    return this;
  }
}

export default new RecruitmentPage();
