import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const unauthorizedHttpError = new HttpError(403, { error: 'User is not authorized' });

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
    beforeEach(async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: createdCostCenterA } = await itAdminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterIntegTest'
      });

      costCenterId = createdCostCenterA.id;
    });

    afterEach(async () => {
      await itAdminSession.resources.costCenters.costCenter(costCenterId).delete();
    });

    test('ITAdmin can soft delete a Cost Center', async () => {
      const response = await itAdminSession.resources.costCenters.costCenter(costCenterId).delete();
      expect(response.status).toEqual(204);
    });

    test('ProjectAdmin cannot soft delete a CostCenter', async () => {
      await expect(pa1Session.resources.costCenters.costCenter(costCenterId).delete()).rejects.toThrow(
        unauthorizedHttpError
      );
    });

    test('Researcher cannot soft delete a CostCenter', async () => {
      await expect(researcherSession.resources.costCenters.costCenter(costCenterId).delete()).rejects.toThrow(
        unauthorizedHttpError
      );
    });

    test('Unauthenticated user cannot soft delete a CostCenter', async () => {
      await expect(anonymousSession.resources.costCenters.costCenter(costCenterId).delete()).rejects.toThrow(
        new HttpError(403, {})
      );
    });
  });

  describe('with Cost Center that does not exist', () => {
    test('it throw 404 error', async () => {
      const invalidId = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await itAdminSession.resources.costCenters.costCenter(invalidId).delete();
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
});
