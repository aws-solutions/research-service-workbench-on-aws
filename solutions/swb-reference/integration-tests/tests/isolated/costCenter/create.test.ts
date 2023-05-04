import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let validCreateRequest: { name: string; description: string; accountId: string };
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    validCreateRequest = {
      name: randomTextGenerator.getFakeText('costCenterName'),
      description: randomTextGenerator.getFakeText('costCenterDescription'),
      accountId: setup.getSettings().get('defaultHostingAccountId')
    };
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with invalid parameters', () => {
    describe('with missing name', () => {
      test('it throw 400 error', async () => {
        const invalidCreateRequest = {
          description: validCreateRequest.description,
          accountId: validCreateRequest.accountId
        };
        try {
          await adminSession.resources.costCenters.create(invalidCreateRequest, false);
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
          await adminSession.resources.costCenters.create(invalidCreateRequest, false);
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
          await adminSession.resources.costCenters.create(invalidCreateRequest, false);
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
      const invailidCreateRequests = invalidAccountIds.map((accountId) => ({
        accountId,
        name: validCreateRequest.name,
        description: validCreateRequest.description
      }));
      await Promise.all(
        invailidCreateRequests.map(async (invalidCreateRequest) => {
          try {
            await adminSession.resources.costCenters.create(invalidCreateRequest, false);
          } catch (error) {
            checkHttpError(
              error,
              new HttpError(400, {
                error: 'Bad Request',
                message: `accountId: Invalid ID`
              })
            );
          }
        })
      );
    });
  });
});
