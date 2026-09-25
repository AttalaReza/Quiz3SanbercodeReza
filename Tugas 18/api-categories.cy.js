/// <reference types="cypress" />

/**
 * Tugas 18 - Test Automation Reza
 */

describe('API Automation - Platzi Fake Store (Categories)', () => {
  const BASE_URL = 'https://api.escuelajs.co/api/v1/categories';

  // Variabel bersama untuk menyimpan id kategori yang dibuat di TC-API-03,
  // lalu dipakai ulang di beberapa test case berikutnya (04-09).
  let createdCategoryId;
  const newCategoryName = `Kategori Reza ${Date.now()}`;
  const updatedCategoryName = `Kategori Reza Updated ${Date.now()}`;

  // ============================================================
  // TC-API-01 (Request #1)
  // GET /categories -> daftar seluruh kategori
  // ============================================================
  it('TC-API-01 | GET semua kategori mengembalikan status 200 dan array tidak kosong', () => {
    cy.request('GET', BASE_URL).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });
  });

  // ============================================================
  // TC-API-02 (Request #2)
  // GET /categories -> validasi struktur/properti tiap item
  // ============================================================
  it('TC-API-02 | Setiap item pada daftar kategori memiliki properti id, name, dan image', () => {
    cy.request('GET', BASE_URL).then((response) => {
      expect(response.status).to.eq(200);
      const firstCategory = response.body[0];
      expect(firstCategory).to.have.property('id');
      expect(firstCategory).to.have.property('name');
      expect(firstCategory).to.have.property('image');
    });
  });

  // ============================================================
  // TC-API-03 (Request #3)
  // POST /categories -> membuat kategori baru
  // ============================================================
  it('TC-API-03 | POST membuat kategori baru mengembalikan status 201 dengan data sesuai yang dikirim', () => {
    cy.request('POST', BASE_URL, {
      name: newCategoryName,
      image: 'https://placeimg.com/640/480/any',
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body.name).to.eq(newCategoryName);

      createdCategoryId = response.body.id; // disimpan untuk test berikutnya
    });
  });

  // ============================================================
  // TC-API-04 (Request #4)
  // GET /categories/{id} -> ambil kategori yang baru dibuat
  // ============================================================
  it('TC-API-04 | GET kategori berdasarkan id yang baru dibuat mengembalikan data yang sesuai', () => {
    cy.request('GET', `${BASE_URL}/${createdCategoryId}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(createdCategoryId);
      expect(response.body.name).to.eq(newCategoryName);
    });
  });

  // ============================================================
  // TC-API-05 (Request #5)
  // PUT /categories/{id} -> update nama kategori
  // ============================================================
  it('TC-API-05 | PUT mengubah nama kategori berhasil, response mengandung nama baru', () => {
    cy.request('PUT', `${BASE_URL}/${createdCategoryId}`, {
      name: updatedCategoryName,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq(updatedCategoryName);
    });
  });

  // ============================================================
  // TC-API-06 (Request #6)
  // PUT /categories/{id} -> update sebagian field saja (partial update)
  // ============================================================
  it('TC-API-06 | PUT hanya mengubah field image (partial update) tetap berhasil', () => {
    const newImage = 'https://api.lorem.space/image/fashion?w=640&h=480&r=999';

    cy.request('PUT', `${BASE_URL}/${createdCategoryId}`, {
      image: newImage,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.image).to.eq(newImage);
      // Nama sebelumnya harus tetap ada (tidak ikut hilang/berubah)
      expect(response.body.name).to.eq(updatedCategoryName);
    });
  });

  // ============================================================
  // TC-API-07 (Request #7)
  // GET /categories/{id}/products -> produk milik kategori tsb
  // ============================================================
  it('TC-API-07 | GET daftar produk pada kategori baru mengembalikan array (boleh kosong)', () => {
    cy.request('GET', `${BASE_URL}/${createdCategoryId}/products`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  // ============================================================
  // TC-API-08 (Request #8)
  // DELETE /categories/{id} -> hapus kategori yang dibuat
  // ============================================================
  it('TC-API-08 | DELETE kategori yang dibuat mengembalikan status 200 dan body true', () => {
    cy.request('DELETE', `${BASE_URL}/${createdCategoryId}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.eq(true);
    });
  });

  // ============================================================
  // TC-API-09 (Request #9)
  // GET /categories/{id} -> kategori yang sudah dihapus, harus gagal
  // ============================================================
  it('TC-API-09 | GET kategori yang sudah dihapus mengembalikan status error (bukti delete berhasil)', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/${createdCategoryId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ============================================================
  // TC-API-10 (Request #10)
  // GET /categories/{id-tidak-valid} -> negative testing format id salah
  // ============================================================
  it('TC-API-10 | GET dengan id berformat tidak valid (huruf) mengembalikan status error', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/abcde`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ============================================================
  // TC-API-11 (Request #11)
  // POST /categories tanpa field wajib 'name' -> negative testing
  // ============================================================
  it('TC-API-11 | POST tanpa field name (wajib) mengembalikan status error', () => {
    cy.request({
      method: 'POST',
      url: BASE_URL,
      body: {
        image: 'https://placeimg.com/640/480/any',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ============================================================
  // TC-API-12 (Request #12)
  // Data-driven testing: membuat beberapa kategori sekaligus dari array
  // data yang berbeda-beda, lalu memvalidasi masing-masing hasilnya.
  // (Menerapkan teknik data-driven testing seperti dicontohkan di materi)
  // ============================================================
  it('TC-API-12 | Data-driven testing - membuat beberapa kategori dari data berbeda sekaligus valid', () => {
    const categoriesData = [
      { name: `Kategori DataDriven A ${Date.now()}`, image: 'https://placeimg.com/640/480/any?a' },
      { name: `Kategori DataDriven B ${Date.now()}`, image: 'https://placeimg.com/640/480/any?b' },
      { name: `Kategori DataDriven C ${Date.now()}`, image: 'https://placeimg.com/640/480/any?c' },
    ];

    categoriesData.forEach((categoryPayload) => {
      cy.request('POST', BASE_URL, categoryPayload).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.name).to.eq(categoryPayload.name);
        expect(response.body.image).to.eq(categoryPayload.image);

        // Bersihkan data setelah divalidasi, supaya tidak menumpuk sampah
        // data di API publik ini.
        cy.request('DELETE', `${BASE_URL}/${response.body.id}`);
      });
    });
  });
});
