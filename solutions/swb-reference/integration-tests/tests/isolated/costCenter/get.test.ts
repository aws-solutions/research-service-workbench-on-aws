import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Cost Center negative tests', () => {
  const setup: Setup = new Setup();
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

  describe('with Cost Center that does was deleted', () => {
    test('it throw 404 error', async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: createdCostCenter } = await adminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterA'
      });

      await adminSession.resources.costCenters.costCenter(createdCostCenter.id).softDelete();

      try {
        await adminSession.resources.costCenters.costCenter(createdCostCenter.id).get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Cost center ${createdCostCenter.id} was deleted`
          })
        );
      }
    });
  });
});
