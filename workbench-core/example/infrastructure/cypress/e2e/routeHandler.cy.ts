/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import jwtDecode, { JwtPayload } from 'jwt-decode';
import Csrf from 'csrf';

declare const jwt_decode: typeof jwtDecode;
declare const csrf: typeof Csrf;

const clientId = Cypress.env('COGNITO_USER_POOL_CLIENT_ID');
const cognitoDomainName = Cypress.env('COGNITO_DOMAIN_NAME');
const callbackUrl = Cypress.env('COGNITO_CALLBACK_URL');
const username = Cypress.env('USERNAME');
const clientSecret = Cypress.env('COGNITO_USER_POOL_CLIENT_SECRET');
const restApiEndpoint = Cypress.env('REST_API_ENDPOINT');
const region = Cypress.env('AWS_REGION');
const userPoolId = Cypress.env('COGNITO_USER_POOL_ID');

const loginUrlParams = new URLSearchParams();
loginUrlParams.append('client_id', clientId);
loginUrlParams.append('response_type', 'code');
loginUrlParams.append('scope', 'openid');
loginUrlParams.append('redirect_uri', callbackUrl);
const loginUrl = `${cognitoDomainName}/login?${loginUrlParams.toString()}`;

const loginWithCognito = () => {
  // Set up testing authentication callback endpoint
  cy.intercept('GET', `${callbackUrl}*`, (req) => {
    req.reply({
      body: `<html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js"></script>
        </head>
        <body><h1>Logged in</h1></body>
      </html>`,
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
};

describe('refreshAccessToken', () => {
  it('should return the id token if the access token is successfully refreshed', () => {
    loginWithCognito();
    // Switch origin in order to read data from authentication callback; all data from
    // parent context needs to be passed as args to be visible in different origin
    cy.origin(
      callbackUrl,
      {
        args: {
          cognitoDomainName,
          clientId,
          callbackUrl,
          username,
          clientSecret,
          restApiEndpoint,
          region,
          userPoolId
        }
      },
      ({
        cognitoDomainName,
        clientId,
        callbackUrl,
        username,
        clientSecret,
        restApiEndpoint,
        region,
        userPoolId
      }) => {
        // Load JWT from CDN since libraries are not accessible from cy.origin and Cy.require is
        // still experimental
        const loadJwtDecode = (next?: () => void) => {
          cy.request('https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js').then(
            ({ body }) => {
              eval(body); // Load JWT token library as global jwt_token
              next?.();
            }
          );
        };
        const verifyIdToken = (idToken: string) => {
          expect(idToken).to.not.be.undefined;
          const tokenData = jwt_decode<JwtPayload & { email: string }>(idToken);
          expect(tokenData.iss).to.equal(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}`);
          expect(tokenData.email).to.equal(username);
        };
        const tokenExchangeRequest = (
          code: string,
          next?: (accessToken: string, refreshToken: string) => void
        ) => {
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
        const refreshTokenRequest = (accessToken: string, refreshToken: string) => {
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
            loadJwtDecode(() => tokenExchangeRequest(code!, refreshTokenRequest));
          });
      }
    );
  });
});

describe('logoutUrl', () => {
  it('should return the logout URL for a logged in user', () => {
    loginWithCognito();

    const csrfGenerator = new Csrf();

    const csrfSecret = csrfGenerator.secretSync();
    const csrfToken = csrfGenerator.create(csrfSecret);

    // Switch origin in order to read data from authentication callback; all data from
    // parent context needs to be passed as args to be visible in different origin
    cy.origin(
      callbackUrl,
      {
        args: {
          cognitoDomainName,
          clientId,
          callbackUrl,
          username,
          clientSecret,
          restApiEndpoint,
          region,
          userPoolId,
          csrfSecret,
          csrfToken
        }
      },
      ({
        cognitoDomainName,
        clientId,
        callbackUrl,
        username,
        clientSecret,
        restApiEndpoint,
        region,
        userPoolId,
        csrfSecret,
        csrfToken
      }) => {
        // Load JWT from CDN since libraries are not accessible from cy.origin and Cy.require is
        // still experimental
        const loadJwtDecode = (next?: () => void) => {
          cy.request('https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js').then(
            ({ body }) => {
              eval(body); // Load JWT token library as global jwt_token
              next?.();
            }
          );
        };

        const verifyIdToken = (idToken: string) => {
          expect(idToken).to.not.be.undefined;
          const tokenData = jwt_decode<JwtPayload & { email: string }>(idToken);

          expect(tokenData.iss).to.equal(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}`);
          expect(tokenData.email).to.equal(username);
        };

        const tokenExchangeRequest = (
          code: string,
          next?: (accessToken: string, refreshToken: string) => void
        ) => {
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

        const logout = (accessToken: string, refreshToken: string) => {
          const origin = 'fakeOrigin';

          cy.request({
            method: 'POST',
            url: `${restApiEndpoint}logout`,
            headers: {
              Cookie: `access_token=${accessToken};refresh_token=${refreshToken};_csrf=${csrfSecret}`,
              ['csrf-token']: csrfToken,
              origin
            }
          }).then(({ body: { logoutUrl } }) => {
            expect(logoutUrl).to.equal(
              `${cognitoDomainName}/logout?client_id=${clientId}&logout_uri=${origin}`
            );
          });
        };

        cy.location('search')
          .should('contain', 'code')
          .then((search) => {
            const searchParams = new URLSearchParams(search);
            const code = searchParams.get('code');

            loadJwtDecode(() => tokenExchangeRequest(code!, logout));
          });
      }
    );
  });
});
