/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with invalid parameters', () => {
    describe('--non encoded pagination token', () => {
      const paginationToken =
        'Q0FJU3FBSUldewktCQWdnREV2d0JBSDBWSWN1T1NYVzVNaGJ4OWI3bFllZFArcFBXMnY3NEptcXpjKzJLNXJxQWV5SkFiaUk2SWxCaFoybHVZWFJwYjI1RGIyNTBhVzUxWVhScGIyNUVWRThpTENKdVpYaDBTMlY1SWpvaVFVRkJRVUZCUVVGRFRqQk1RVkZGUWxsWFpXUnJZakJRVTNCcFVVTjRWbkJXWjFkS1NYbGlLMFZSTlUxSFZUTmhhVFpEYWxGNE5HWlZkalZzWW0xWk4xbHRSVE5OZWxFd1RucFZkRTFVYXpWT1V6QXdXa1JOZDB4WFNUTlBSMDEwVDBkRk1WbHFhR2xaYWtWNlQwUk5NVTkzUFQwaUxDSndZV2RwYm1GMGFXOXVSR1Z3ZEdnaU9qSXNJbkJ5WlhacGIzVnpVbVZ4ZFdWemRGUnBiV1VpT2pFMk9EVXhNVGt3TXpRek1EVjlHaUNvWC80NFRvUWZ2N1JGV3c3TktxNys5UW9VK3hBSmxhRmpmMHhXUDE2RytRPT0=';
      const queryParams = { paginationToken };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                "1 validation error detected: Value 'CAISqAII]{\t-\t����\t �Y%��=Ma\\�5����ݱe��@��A\\����)��錬�,�����)��$�%�\t�hɱ�eaI���������\\��eaI����Y�1\r)�ia��L�X�%���EU\tEU\tEUQ�\t5EYE��ai]I�e�\tET�\t�UU8�Y�\t]hő-Ma��,�YI9T�!YQ9��Qi���9iY��Y�e��i8ű�IQ99���Q��Y��U��Y=U��]�I9���aMQ9AH���P��5Y�Ņ�i��X�P�I95T��AP��1\r)�e]������\\��IYݑ��=�%�%�\t�iai���Y�U�Y�]Y�I��]U�=��=U�5Q��5�E�5X��\r�`���Q�E���I]��9-�ܬ�E�T��)������]@���D��' at 'paginationToken' failed to satisfy constraint: Member must satisfy regular expression pattern: [\\S]+"
            })
          );
        }
      });
    });

    describe('--non number page size', () => {
      const pageSize = 'one';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be a number`
            })
          );
        }
      });
    });

    describe('--page size too small', () => {
      const pageSize = '0';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be Between 1 and 100`
            })
          );
        }
      });
    });

    describe('--page size too large', () => {
      const pageSize = '110';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be Between 1 and 100`
            })
          );
        }
      });
    });
  });
});
