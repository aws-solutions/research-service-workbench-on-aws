/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import { ADMIN_PASSWORD_PROPERTY, ADMIN_USER_PROPERTY, COGNITO_DOMAIN_NAME_PROPERTY } from './constants';

const getLoginInfo = (role: string): { user: string; password: string } => {
  switch (role) {
    case 'ITAdmin':
      return { user: Cypress.env(ADMIN_USER_PROPERTY), password: Cypress.env(ADMIN_PASSWORD_PROPERTY) };
    default:
      return { user: '', password: '' };
  }
};

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop completed with undelivered notifications') //known issue with cypress https://github.com/quasarframework/quasar/issues/2233
);

Cypress.Commands.add('login', (role: string) => {
  const login = getLoginInfo(role);
  cy.visit('/');
  cy.get('[data-testid="login"]').should('be.visible');
  cy.get('[data-testid="login"]').click();
  cy.origin(Cypress.env(COGNITO_DOMAIN_NAME_PROPERTY), { args: login }, ({ user, password }) => {
    cy.get('input[name=username]:visible', { timeout: 10000 }).type(user); //wait up to 10 seconds to have the username field displayed
    cy.get('input[name=password]:visible').type(password);
    cy.get('[name=signInSubmitButton]:visible').click();
  });
  cy.get('[data-testid="environmentListHeader"]', { timeout: 10000 })
    .contains('Workspaces')
    .should('be.visible'); //redirection for environments may take time to load
  cy.location('pathname').should('eq', '/environments/');
});

Cypress.Commands.add('logout', () => {
  cy.get('#header [data-utility-index=0]').click();
  cy.get('[data-testid=signout]').click();
  cy.location('pathname').should('eq', '/');
  cy.get('[data-testid="login"]').should('be.visible');
});
