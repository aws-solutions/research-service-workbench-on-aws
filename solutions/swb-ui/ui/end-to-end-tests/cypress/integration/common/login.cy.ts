describe('IT Admin Login', () => {
  it(
    'Should login as IT Admin',
    {
      retries: {
        runMode: 2
      }
    },
    () => {
      cy.login('ITAdmin');
    }
  );
});

export {};
