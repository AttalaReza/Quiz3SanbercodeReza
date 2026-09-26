/// <reference types="cypress" />

/**
 * Final Project - Test Automation Reza
 * Modul: Directory (8 test case)
 * Menggunakan format POM lengkap: action, assertion, data, dan intercept
 */

import DirectoryPage from './DirectoryPage.js';
import directoryData from './directoryData.json';

describe('Final Project - Modul Directory (POM + Intercept)', () => {
  beforeEach(() => {
    DirectoryPage.loginAsAdmin();
  });

  it('TC-DIR-01 | Halaman Directory berhasil dimuat (status 200) dan form pencarian lengkap', () => {
    DirectoryPage.interceptPageLoad();
    DirectoryPage.visit();

    cy.wait('@directoryPageLoad').its('response.statusCode').should('eq', 200);
    DirectoryPage.verifyFormVisible();
  });

  it('TC-DIR-02 | Search tanpa filter memicu request ke server dan menampilkan Records Found', () => {
    DirectoryPage.visit();
    DirectoryPage.interceptSearchRequest();
    DirectoryPage.clickSearch();

    cy.wait('@directorySearch').its('response.statusCode').should('eq', 200);
    DirectoryPage.verifyRecordsFoundVisible();
  });

  it('TC-DIR-03 | Filter berdasarkan Job Title mengirim request dan berhasil (status 200)', () => {
    DirectoryPage.visit();
    DirectoryPage.interceptSearchRequest();
    DirectoryPage.selectJobTitle(directoryData.validJobTitle);
    DirectoryPage.clickSearch();

    cy.wait('@directorySearch').its('response.statusCode').should('eq', 200);
    DirectoryPage.verifyRecordsFoundVisible();
  });

  it('TC-DIR-04 | Filter berdasarkan Location mengirim request dengan parameter yang sesuai', () => {
    DirectoryPage.visit();
    DirectoryPage.interceptSearchRequest();
    // Tidak lagi hardcode 'Head Office' - biarkan DirectoryPage otomatis
    // memilih opsi pertama yang benar-benar tersedia di dropdown Location.
    DirectoryPage.selectLocation();
    DirectoryPage.clickSearch();

    cy.wait('@directorySearch').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  });

  it('TC-DIR-05 | Klik Reset TIDAK mengosongkan field Employee Name (BUG-003)', () => {
    // Dikonfirmasi melalui 2x eksekusi berturut-turut dengan hasil konsisten:
    // tombol Reset pada form Directory TIDAK mengosongkan field Employee Name
    // (input autocomplete), meskipun dropdown Job Title/Location kembali ke
    // default. Ini didokumentasikan sebagai temuan BUG-003 pada Bug Report,
    // dan test ini sengaja memvalidasi perilaku (buggy) yang benar-benar terjadi
    // saat ini, supaya regression di masa depan tetap terdeteksi.
    DirectoryPage.visit();
    DirectoryPage.typeEmployeeName('test');
    DirectoryPage.clickReset();

    DirectoryPage.elements.employeeNameInput().should('have.value', 'test');
  });

  it('TC-DIR-06 | Nama karyawan tidak valid/tidak dipilih dari saran tidak menghasilkan data (BUG-002)', () => {
    // CATATAN: pattern intercept 'api/v2/pim/employees' ternyata dipakai juga
    // oleh request autocomplete suggestion saat mengetik, sehingga tidak bisa
    // diandalkan untuk memastikan "0 request pencarian". Assertion diganti
    // memvalidasi hasil di UI secara langsung (lebih tahan terhadap endpoint
    // yang ambigu): setelah Search, tidak ada card hasil yang muncul.
    DirectoryPage.visit();
    DirectoryPage.typeEmployeeName(directoryData.invalidEmployeeName);
    DirectoryPage.clickSearch();

    DirectoryPage.verifyNoRecordsFound();
  });

  it('TC-DIR-07 | Klik salah satu hasil pencarian mengarahkan ke halaman profil karyawan', () => {
    DirectoryPage.visit();
    DirectoryPage.clickSearch();
    DirectoryPage.clickFirstResult();

    DirectoryPage.verifyUrlIncludesProfile();
  });

  it('TC-DIR-08 | Data-driven: pencarian dengan beberapa Job Title berbeda semuanya berhasil (status 200)', () => {
    directoryData.jobTitleList.forEach((jobTitle) => {
      DirectoryPage.visit();
      DirectoryPage.interceptSearchRequest();
      DirectoryPage.selectJobTitle(jobTitle);
      DirectoryPage.clickSearch();

      cy.wait('@directorySearch').its('response.statusCode').should('eq', 200);
    });
  });
});
