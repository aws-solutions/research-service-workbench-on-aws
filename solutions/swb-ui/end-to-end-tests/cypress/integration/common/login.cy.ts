describe('IT Admin Login', () => {
  it('Should login as IT Admin', () => {
    cy.login('ITAdmin');
  });
});

export {};
