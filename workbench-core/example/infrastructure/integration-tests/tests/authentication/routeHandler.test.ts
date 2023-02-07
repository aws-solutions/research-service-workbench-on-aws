/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

const setup: Setup = new Setup();

describe('authentication route handler integration tests', () => {
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    anonymousSession = await setup.createAnonymousSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('getAuthorizationCodeUrl', () => {
    let stateVerifier: string;
    let codeChallenge: string;
    let origin: string;

    beforeEach(() => {
      stateVerifier = 'fakeStateVerifier';
      codeChallenge = 'fakeCodeChallenge';
      origin = 'fakeWebsiteUrl';
    });

    it('should return the signInUrl', async () => {
      const { data } = await anonymousSession.resources.authentication.login({
        stateVerifier,
        codeChallenge,
        origin
      });

      const domain = setup.getSettings().get('ExampleCognitoDomainName');
      const clientId = setup.getSettings().get('ExampleCognitoUserPoolClientId');

      expect(data.signInUrl).toBe(
        `${domain}/oauth2/authorize?client_id=${clientId}&response_type=code&scope=openid&redirect_uri=${origin}&state=${stateVerifier}&code_challenge_method=S256&code_challenge=${codeChallenge}`
      );
      expect(data.csrfToken).toBeDefined();
    });

    it('should throw 400 when the stateVerifier param is missing', async () => {
      await expect(
        anonymousSession.resources.authentication.login({ codeChallenge, origin })
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('should throw 400 when the codeChallenge param is missing', async () => {
      await expect(
        anonymousSession.resources.authentication.login({ stateVerifier, origin })
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('should throw 400 when the origin header isnt set', async () => {
      await expect(
        anonymousSession.resources.authentication.login({ stateVerifier, codeChallenge })
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });

  describe('isUserLoggedIn', () => {
    it('should return false for an invalid refresh token', async () => {
      const { data } = await anonymousSession.resources.authentication.loggedIn({
        access: true,
        refresh: false
      });

      expect(data.loggedIn).toBe(false);
    });
    it('should return false for an invalid access token', async () => {
      const { data } = await anonymousSession.resources.authentication.loggedIn({
        access: false,
        refresh: true
      });

      expect(data.loggedIn).toBe(false);
    });
    it('should return false for an invalid refresh and access tokens', async () => {
      const { data } = await anonymousSession.resources.authentication.loggedIn({
        access: true,
        refresh: true
      });

      expect(data.loggedIn).toBe(false);
    });
    it('should return false if no tokens are provided', async () => {
      const { data } = await anonymousSession.resources.authentication.loggedIn({
        access: false,
        refresh: false
      });

      expect(data.loggedIn).toBe(false);
    });
  });
});
