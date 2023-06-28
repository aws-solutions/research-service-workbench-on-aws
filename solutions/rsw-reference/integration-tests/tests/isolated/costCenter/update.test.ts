import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Update Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
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
    const name = 'costCenter-nameUpdated';

    beforeEach(async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: costCenter } = await itAdminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterIntegTest'
      });

      costCenterId = costCenter.id;
    });

    afterEach(async () => {
      await itAdminSession.resources.costCenters.costCenter(costCenterId).delete();
    });

    test('ITAdmin can update a Cost Center', async () => {
      const response = await itAdminSession.resources.costCenters
        .costCenter(costCenterId)
        .update({ name }, true);

      expect(response.status).toEqual(200);
    });

    test('ProjectAdmin cannot update a CostCenter', async () => {
      await expect(
        pa1Session.resources.costCenters.costCenter(costCenterId).update({ name }, true)
      ).rejects.toThrow(unauthorizedHttpError);
    });

    test('Researcher cannot update a CostCenter', async () => {
      await expect(
        researcherSession.resources.costCenters.costCenter(costCenterId).update({ name }, true)
      ).rejects.toThrow(unauthorizedHttpError);
    });

    test('Unauthenticated user cannot update a CostCenter', async () => {
      await expect(
        anonymousSession.resources.costCenters.costCenter(costCenterId).update({ name }, true)
      ).rejects.toThrow(new HttpError(403, {}));
    });
  });

  describe('with Cost Center that does not exist', () => {
    test('it throw 404 error', async () => {
      const invalidId = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await itAdminSession.resources.costCenters
          .costCenter(invalidId)
          .update({ name: randomTextGenerator.getFakeText('costCenterName') }, true);
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
  describe('with invalid parameters', () => {
    test('a name that is longer than allowed throws 404 error', async () => {
      const id = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        const name =
          'atrudea-test-cost-centeratrudea-test-cost-centeratrudea-test- cost-centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- center-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centert-cost-centeratrudea-test-cost-centeratrudea- test-cost-centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test- cost-centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- centeratrudea-test-cost-centeratrudea-test-cost-centeratrudea-test-cost- center';
        await itAdminSession.resources.costCenters.costCenter(id).update({ name }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message:
              'name: Input must be 112 characters or less. name: must contain only letters, numbers, hyphens, underscores, and periods'
          })
        );
      }
    });
    test('with incorrect name type it throw 404 error', async () => {
      const id = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await itAdminSession.resources.costCenters
          .costCenter(id)
          .update({ name: 1 as unknown as string }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: 'name: Expected string, received number'
          })
        );
      }
    });
    test('with incorrect description type it throw 404 error', async () => {
      const id = 'cc-abcdabcd-2199-46be-ac89-751a90f1999e';
      try {
        await itAdminSession.resources.costCenters
          .costCenter(id)
          .update({ description: 1 as unknown as string }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: 'description: Expected string, received number'
          })
        );
      }
    });
  });
});
