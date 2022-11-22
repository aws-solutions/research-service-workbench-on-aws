import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Update Cost Center negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with Cost Center that does not exist', () => {
    test('it throw 404 error', async () => {
      const invalidId = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await adminSession.resources.costCenters
          .costCenter(invalidId)
          .update({ name: randomTextGenerator.getFakeText('costCenterName') }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            statusCode: 404,
            error: 'Not Found',
            message: `Could not find cost center ${invalidId}`
          })
        );
      }
    });
  });
  describe('with invalid parameters', () => {
    describe('with incorrect name type', () => {
      test('it throw 404 error', async () => {
        const id = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
        try {
          await adminSession.resources.costCenters
            .costCenter(id)
            .update({ name: 1 as unknown as string }, true);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: 'name: Expected string, received number'
            })
          );
        }
      });
    });
    describe('with incorrect description type', () => {
      test('it throw 404 error', async () => {
        const id = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
        try {
          await adminSession.resources.costCenters
            .costCenter(id)
            .update({ description: 1 as unknown as string }, true);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: 'description: Expected string, received number'
            })
          );
        }
      });
    });
  });
});
