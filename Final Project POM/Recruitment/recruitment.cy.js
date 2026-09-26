/// <reference types="cypress" />

/**
 * Final Project - Test Automation Reza
 * Modul: Recruitment (8 test case)
 * Menggunakan format POM lengkap: action, assertion, data, dan intercept
 */

import RecruitmentPage from './RecruitmentPage.js';
import recruitmentData from './recruitmentData.json';

describe('Final Project - Modul Recruitment (POM + Intercept)', () => {
  beforeEach(() => {
    RecruitmentPage.loginAsAdmin();
  });

  it('TC-REC-01 | Halaman Candidates berhasil dimuat (status 200) dan tombol Add terlihat', () => {
    RecruitmentPage.interceptCandidatesPageLoad();
    RecruitmentPage.visitCandidates();

    cy.wait('@candidatesPageLoad').its('response.statusCode').should('eq', 200);
    RecruitmentPage.verifyAddButtonVisible();
  });

  it('TC-REC-02 | Menambahkan kandidat valid berhasil terkirim ke server dengan data yang benar', () => {
    RecruitmentPage.visitCandidates();
    RecruitmentPage.clickAddCandidate();
    RecruitmentPage.interceptSaveCandidateRequest();

    RecruitmentPage.fillFirstName(recruitmentData.validCandidate.firstName);
    RecruitmentPage.fillLastName(recruitmentData.validCandidate.lastName);
    RecruitmentPage.fillEmail(recruitmentData.validCandidate.email);
    RecruitmentPage.clickSave();

    cy.wait('@saveCandidateRequest').then((interception) => {
      expect(interception.response.statusCode).to.be.within(200, 299);
      // request.body kemungkinan berupa OBJECT (JSON), bukan string, sehingga
      // di-stringify dulu supaya bisa dicek pakai .include() dengan aman.
      expect(JSON.stringify(interception.request.body)).to.include(recruitmentData.validCandidate.firstName);
    });
  });

  it('TC-REC-03 | Tidak ada request terkirim saat First Name/Last Name kosong (validasi client-side)', () => {
    RecruitmentPage.visitCandidates();
    RecruitmentPage.clickAddCandidate();
    RecruitmentPage.interceptSaveCandidateRequest();

    RecruitmentPage.clickSave();

    cy.wait(1000);
    cy.get('@saveCandidateRequest.all').should('have.length', 0);
    RecruitmentPage.verifyRequiredErrorVisible();
  });

  it('TC-REC-04 | Tidak ada request terkirim saat format Email tidak valid (validasi client-side)', () => {
    RecruitmentPage.visitCandidates();
    RecruitmentPage.clickAddCandidate();
    RecruitmentPage.interceptSaveCandidateRequest();

    RecruitmentPage.fillFirstName(recruitmentData.invalidEmailCandidate.firstName);
    RecruitmentPage.fillLastName(recruitmentData.invalidEmailCandidate.lastName);
    RecruitmentPage.fillEmail(recruitmentData.invalidEmailCandidate.email);
    RecruitmentPage.clickSave();

    cy.wait(1000);
    cy.get('@saveCandidateRequest.all').should('have.length', 0);
  });

  it('TC-REC-05 | Pencarian kandidat berdasarkan nama berhasil (status 200) dan menampilkan Records Found', () => {
    RecruitmentPage.visitCandidates();
    RecruitmentPage.interceptSearchRequest();
    RecruitmentPage.searchCandidateByName(recruitmentData.candidateSearchName);
    RecruitmentPage.clickSearch();

    cy.wait('@searchRequest').its('response.statusCode').should('eq', 200);
    RecruitmentPage.verifyRecordsFoundVisible();
  });

  it('TC-REC-06 | Data-driven: menambahkan beberapa kandidat dari data berbeda semuanya berhasil terkirim', () => {
    const candidatesData = [
      { firstName: 'Andi', lastName: 'Wijaya', email: `andi.${Date.now()}@example.com` },
      { firstName: 'Rina', lastName: 'Marlina', email: `rina.${Date.now()}@example.com` },
    ];

    candidatesData.forEach((candidate) => {
      RecruitmentPage.visitCandidates();
      RecruitmentPage.clickAddCandidate();
      RecruitmentPage.interceptSaveCandidateRequest();

      RecruitmentPage.fillFirstName(candidate.firstName);
      RecruitmentPage.fillLastName(candidate.lastName);
      RecruitmentPage.fillEmail(candidate.email);
      RecruitmentPage.clickSave();

      cy.wait('@saveCandidateRequest').then((interception) => {
        expect(interception.response.statusCode).to.be.within(200, 299);
        expect(JSON.stringify(interception.request.body)).to.include(candidate.firstName);
      });
    });
  });

  it('TC-REC-07 | Halaman Vacancies berhasil dimuat (status 200) dan tombol Add terlihat', () => {
    RecruitmentPage.interceptVacanciesPageLoad();
    RecruitmentPage.visitVacancies();

    cy.wait('@vacanciesPageLoad').its('response.statusCode').should('eq', 200);
    RecruitmentPage.verifyAddButtonVisible();
  });

  it('TC-REC-08 | Menyimpan Vacancy tanpa mengisi Vacancy Name (field wajib) menampilkan pesan Required', () => {
    RecruitmentPage.visitVacancies();
    RecruitmentPage.clickAddVacancy();
    RecruitmentPage.clickSave();

    RecruitmentPage.verifyRequiredErrorVisible();
    // Karena validasi gagal, form tetap di halaman Add (tidak redirect)
    cy.url().should('include', '/recruitment/addJobVacancy');
  });
});
