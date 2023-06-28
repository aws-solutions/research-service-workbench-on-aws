import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const forbiddenHttpError = new HttpError(403, { error: 'User is not authorized' });
  const unauthorizedHttpError = new HttpError(401, {});

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    pa1Session = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('authorization test:', () => {
    let costCenterId: string;

    beforeAll(async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: costCenter } = await itAdminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterIntegTest'
      });

      costCenterId = costCenter.id;
    });

    afterAll(async () => {
      await itAdminSession.resources.costCenters.costCenter(costCenterId).delete();
    });

    test('ITAdmin can get a Cost Center', async () => {
      const response = await itAdminSession.resources.costCenters.costCenter(costCenterId).get();

      expect(response.status).toEqual(200);
    });

    test('ProjectAdmin cannot get a CostCenter', async () => {
      await expect(pa1Session.resources.costCenters.costCenter(costCenterId).get()).rejects.toThrow(
        forbiddenHttpError
      );
    });

    test('Researcher cannot get a CostCenter', async () => {
      await expect(researcherSession.resources.costCenters.costCenter(costCenterId).get()).rejects.toThrow(
        forbiddenHttpError
      );
    });

    test('Unauthenticated user cannot get a CostCenter', async () => {
      await expect(anonymousSession.resources.costCenters.costCenter(costCenterId).get()).rejects.toThrow(
        unauthorizedHttpError
      );
    });
  });

  describe('with Cost Center that does not exist', () => {
    test('it throw 404 error', async () => {
      const invalidId = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await itAdminSession.resources.costCenters.costCenter(invalidId).get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find cost center`
          })
        );
      }
    });
  });

  describe('with a bad character', () => {
    test('it throw 404 error', async () => {
      const invalidId = '%ff';
      try {
        await itAdminSession.resources.costCenters.costCenter(invalidId).get();
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
        await itAdminSession.resources.costCenters.costCenter(invalidId).get();
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
