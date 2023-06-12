import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  const paabHelper: PaabHelper = new PaabHelper();

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    pa1Session = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await setup.cleanup();
    await paabHelper.cleanup();
  });

  describe('authorization test:', () => {
    let costCenterId: string;
    beforeEach(async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: createdCostCenterA } = await itAdminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterA'
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
      try {
        await pa1Session.resources.costCenters.costCenter(costCenterId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Researcher cannot soft delete a CostCenter', async () => {
      try {
        await researcherSession.resources.costCenters.costCenter(costCenterId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
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
            message: `Could not find cost center ${invalidId}`
          })
        );
      }
    });
  });
});
