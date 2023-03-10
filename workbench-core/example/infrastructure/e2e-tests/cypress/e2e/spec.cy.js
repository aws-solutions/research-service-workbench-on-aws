describe('spec.cy.js', () => {
  it('shoud visit', () => {
    cy.visit('/');

    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .cognito-asf').as('modal');

    cy.get('@modal').find('#signInFormUsername').type('otlciuli@amazon.com');
    cy.get('@modal').find('#signInFormPassword').type('Computer-123');

    cy.get('@modal').find('input[type=submit]').click();
  });
});
