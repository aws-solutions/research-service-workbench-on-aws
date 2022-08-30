describe('IT Admin Login', () => {
  it('Should login as IT Admin', async () => {
    cy.login('ITAdmin');
  });
});
