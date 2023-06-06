import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Cost Center negative tests', () => {
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

  describe('with Cost Center that does not exist', () => {
    test('it throw 404 error', async () => {
      const invalidId = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await adminSession.resources.costCenters.costCenter(invalidId).get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find cost center ${invalidId}`
          })
        );
      }
    });
  });

  describe('with a bad character', () => {
    test('it throw 404 error', async () => {
      const invalidId = '%ff';
      try {
        await adminSession.resources.costCenters.costCenter(invalidId).get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Not Found`
          })
        );
      }
    });
  });

  describe('with an id that is too long', () => {
    test('it throw 404 error', async () => {
      const invalidId =
        'cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9- 4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6- 13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc- 1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41- 8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4- aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9- 4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6- 13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc- 1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41- 8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4- aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9- 4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6- 13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc- 1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41- 8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4- aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9- 4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6- 13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc- 1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41- 8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4- aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9- 4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6- 13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc- 1f457ad6-13b9-4db4-aa41-8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41- 8cee25abc9b9cc-1f457ad6-13b9-4db4-aa41-8cee25abc9b9';
      try {
        await adminSession.resources.costCenters.costCenter(invalidId).get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Not Found`
          })
        );
      }
    });
  });
});
