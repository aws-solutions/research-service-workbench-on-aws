/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

describe('refreshAccessToken', () => {
  it('should return the id token if the access token is successfully refreshed', () => {
    const clientId = Cypress.env('COGNITO_USER_POOL_CLIENT_ID');
    const cognitoDomainName = Cypress.env('COGNITO_DOMAIN_NAME');
    const callbackUrl = Cypress.env('COGNITO_CALLBACK_URL');
    const username = Cypress.env('USERNAME');

    const loginUrlParams = new URLSearchParams();
    loginUrlParams.append('client_id', clientId);
    loginUrlParams.append('response_type', 'code');
    loginUrlParams.append('scope', 'openid');
    loginUrlParams.append('redirect_uri', callbackUrl);
    const loginUrl = `${cognitoDomainName}/login?${loginUrlParams.toString()}`;

    // Set up testing authentication callback endpoint
    cy.intercept('GET', `${callbackUrl}*`, (req) => {
      req.reply({
        body: `<html><head><script src="https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js"></script></head><body><h1>Logged in</h1></body></html>`,
        statusCode: 200
      });
    }).as('callbackUrl');

    cy.visit(loginUrl);

    // There are two sets of UI elements (mobile and desktop)
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .cognito-asf').as('modal');
    cy.get('@modal').find('#signInFormUsername').type(username);
    cy.get('@modal').find('#signInFormPassword').type(Cypress.env('PASSWORD'), {
      log: false
    });

    cy.get('@modal').find('input[type=submit]').click();

    cy.wait('@callbackUrl');

    // Switch origin in order to read data from authentication callback; all data from
    // parent context needs to be passed as args to be visible in different origin
    cy.origin(
      callbackUrl,
      { args: { cognitoDomainName, clientId, callbackUrl, username } },
      ({ cognitoDomainName, clientId, callbackUrl, username }) => {
        const clientSecret = Cypress.env('COGNITO_USER_POOL_CLIENT_SECRET');
        const restApiEndpoint = Cypress.env('REST_API_ENDPOINT');
        const region = Cypress.env('AWS_REGION');
        const userPoolId = Cypress.env('COGNITO_USER_POOL_ID');

        // Load JWT from CDN since libraries are not accessible from cy.origin and Cy.require is
        // still experimental
        const loadJwtDecode = (next) => {
          cy.request('https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js').then(
            ({ body }) => {
              eval(body); // Load JWT token library as global window.jwt_token
              next?.();
            }
          );
        };

        const verifyIdToken = (idToken) => {
          expect(idToken).to.not.be.undefined;
          const tokenData = window.jwt_decode(idToken);

          expect(tokenData.iss).to.equal(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}`);
          expect(tokenData.email).to.equal(username);
        };

        const tokenExchangeRequest = (code, next) => {
          // Exchange authorization code for tokens (see step 5 in https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
          cy.request({
            method: 'POST',
            url: `${cognitoDomainName}/oauth2/token`,
            body: {
              code,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: callbackUrl
            },
            form: true
          }).then(({ body: { id_token, access_token, refresh_token } }) => {
            expect(access_token).to.not.be.undefined;
            expect(refresh_token).to.not.be.undefined;

            verifyIdToken(id_token);

            next?.(access_token, refresh_token);
          });
        };

        const refreshTokenRequest = (accessToken, refreshToken) => {
          cy.request({
            method: 'GET',
            url: `${restApiEndpoint}refresh`,
            headers: {
              Cookie: `access_token=${accessToken};refresh_token=${refreshToken}`
            }
          }).then(({ body: { idToken } }) => {
            verifyIdToken(idToken);
          });
        };

        cy.location('search')
          .should('contain', 'code')
          .then((search) => {
            const searchParams = new URLSearchParams(search);
            const code = searchParams.get('code');

            loadJwtDecode(() => tokenExchangeRequest(code, refreshTokenRequest));
          });
      }
    );
  });
});
