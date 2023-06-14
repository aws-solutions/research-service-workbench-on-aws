import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  let validCreateRequest: { name: string; description: string; accountId: string };
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  const unauthorizedHttpError = new HttpError(403, { error: 'User is not authorized' });

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    itAdminSession = await setup.getDefaultAdminSession();
    pa1Session = await setup.getSessionForUserType('projectAdmin1');
    researcherSession = await setup.getSessionForUserType('researcher1');
    anonymousSession = await setup.createAnonymousSession();

    validCreateRequest = {
      name: randomTextGenerator.getFakeText('costCenterName'),
      description: randomTextGenerator.getFakeText('costCenterDescription'),
      accountId: setup.getSettings().get('defaultHostingAccountId')
    };
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('authorization test:', () => {
    test('ITAdmin can create Cost Center', async () => {
      const response = await itAdminSession.resources.costCenters.create(validCreateRequest);

      expect(response.status).toEqual(201);
    });

    test('ProjectAdmin cannot create CostCenter', async () => {
      await expect(pa1Session.resources.costCenters.create(validCreateRequest)).rejects.toThrow(
        unauthorizedHttpError
      );
    });

    test('Researcher cannot create CostCenter', async () => {
      await expect(researcherSession.resources.costCenters.create(validCreateRequest)).rejects.toThrow(
        unauthorizedHttpError
      );
    });

    test('Unauthorized user cannot create CostCenter', async () => {
      await expect(anonymousSession.resources.costCenters.create(validCreateRequest)).rejects.toThrow(
        new HttpError(403, {})
      );
    });
  });

  describe('with invalid parameters', () => {
    describe('with missing name', () => {
      test('it throw 400 error', async () => {
        const invalidCreateRequest = {
          description: validCreateRequest.description,
          accountId: validCreateRequest.accountId
        };
        try {
          await itAdminSession.resources.costCenters.create(invalidCreateRequest, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'name: Required'
            })
          );
        }
      });
    });
    describe('with missing description', () => {
      test('it throw 400 error', async () => {
        const invalidCreateRequest = {
          name: validCreateRequest.name,
          accountId: validCreateRequest.accountId
        };
        try {
          await itAdminSession.resources.costCenters.create(invalidCreateRequest, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'description: Required'
            })
          );
        }
      });
    });
    describe('with missing accountId', () => {
      test('it throw 400 error', async () => {
        const invalidCreateRequest = {
          name: validCreateRequest.name,
          description: validCreateRequest.description
        };
        try {
          await itAdminSession.resources.costCenters.create(invalidCreateRequest, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'accountId: Required'
            })
          );
        }
      });
    });

    test('with invalid accountId', async () => {
      const invalidAccountIds: string[] = generateInvalidIds(resourceTypeToKey.account.toLowerCase());

      const invalidCreateRequests = invalidAccountIds.map((accountId) => ({
        accountId,
        name: validCreateRequest.name,
        description: validCreateRequest.description
      }));

      for (const invalidRequest of invalidCreateRequests) {
        try {
          await itAdminSession.resources.costCenters.create(invalidRequest, false);
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(400, {
              error: 'Bad Request',
              message: `accountId: Invalid ID`
            })
          );
        }
      }
    });
  });
});
