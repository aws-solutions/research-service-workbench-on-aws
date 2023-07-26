/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

const setup: Setup = new Setup();

describe('authentication middleware integration tests', () => {
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

  describe('verifyToken', () => {
    it('should throw 401 when the user does not provide an access token', async () => {
      await expect(anonymousSession.resources.authentication.dummyAccessTokenRoute()).rejects.toThrow(
        new HttpError(401, {})
      );
    });

    it('should throw 401 when the user provides an invalid access token', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyAccessTokenRoute('invalidAccessToken')
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user provides an access token that is not a string', async () => {
      await expect(anonymousSession.resources.authentication.dummyAccessTokenRoute(123)).rejects.toThrow(
        new HttpError(401, {})
      );
    });
  });

  describe('csurf', () => {
    it('should throw 401 when the user does not provide a csrf-token header', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: true,
          includeToken: false
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user does not provide a _csrf cookie', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: false,
          includeToken: true
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user does not provide a _csrf cookie nor a csrf-token header', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: false,
          includeToken: false
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user provides an invalid _csrf cookie', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: true,
          includeToken: true,
          invalidCookie: true
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user provides an invalid csrf-token header', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: true,
          includeToken: true,
          invalidToken: true
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 401 when the user provides both an invalid _csrf cookie and an invalid csrf-token header', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({
          includeCookie: true,
          includeToken: true,
          invalidCookie: true,
          invalidToken: true
        })
      ).rejects.toThrow(new HttpError(401, {}));
    });

    it('should throw 403 when the user provides a valid csrf cookie and token', async () => {
      await expect(
        anonymousSession.resources.authentication.dummyCsurfRoute({ includeCookie: true, includeToken: true })
      ).rejects.toThrow(new HttpError(401, {}));
    });
  });
});
