/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const callbackUrl = Cypress.env('COGNITO_CALLBACK_URL');
const username = Cypress.env('USERNAME');
const password = Cypress.env('PASSWORD');

const navigateToApplication = () => {
  cy.readFile('build/cypress/index.js').then((data) => {
    cy.intercept('GET', `${callbackUrl}/*`, (req) => {
      req.headers['content-type'] = 'text/html';
      req.reply(`<html><head><script>${data}</script></head><body><div id="root" /></body></html>`);
    }).as('callbackUrl');
  });

  cy.visit(`${callbackUrl}/start`);
};

const login = () => {
  navigateToApplication();

  cy.contains('Login').click();

  cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .cognito-asf').as('modal');

  cy.get('@modal').find('#signInFormUsername').type(username);
  cy.get('@modal').find('#signInFormPassword').type(password, {
    log: false
  });

  cy.get('@modal').find('input[type=submit]').click();

  cy.url().should('eq', `${callbackUrl}/`);
};

describe('authRoutes', () => {
  it('can determine if user is logged in', () => {
    navigateToApplication();

    cy.contains('Is logged in?').click();

    cy.get('#user-logged-in-state').should('contain', 'false');

    login();

    let currentIdToken;

    cy.get('#id-token').then(($$idToken) => (currentIdToken = $$idToken.text()));

    cy.contains('Is logged in?').click();

    cy.get('#user-logged-in-state').should('contain', 'true');
    cy.get('#id-token').then(($$idToken) => {
      expect($$idToken.text()).not.equal(currentIdToken);
      currentIdToken = $$idToken.text();
    });
  });

  it('can refresh token', () => {
    login();

    let currentIdToken;

    cy.get('#id-token').then(($$idToken) => (currentIdToken = $$idToken.text()));

    cy.contains('Refresh').click();

    cy.get('#refresh-token-state').should('contain', 'success');
    cy.get('#id-token').then(($$idToken) => {
      expect($$idToken.text()).not.equal(currentIdToken);
      currentIdToken = $$idToken.text();
    });
  });

  it('can log out', () => {
    login();

    cy.contains('Logout').click();

    cy.get('#logout-state').should('contain', 'success');
    cy.contains('Is logged in?').click();
    cy.get('#user-logged-in-state').should('contain', 'false');
    cy.contains('Refresh').click();
    cy.get('#refresh-token-state').should('contain', 'Request failed with status code 401');
  });
});
