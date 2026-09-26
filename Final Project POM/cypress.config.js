const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://opensource-demo.orangehrmlive.com",
    viewportWidth: 1366,
    viewportHeight: 768,

    // Situs demo ini publik dan dipakai banyak orang untuk latihan,
    // sehingga kadang responnya lebih lambat dari aplikasi biasa.
    // Timeout dinaikkan supaya test tidak gagal hanya karena masalah
    // kecepatan jaringan, bukan karena aplikasi/scriptnya salah.
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 15000,

    video: true,
    screenshotOnRunFailure: true,

    // Retry otomatis 1x khusus saat `cypress run` (headless/CI),
    // untuk meredam flaky test akibat lambatnya server demo publik.
    retries: {
      runMode: 1,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
