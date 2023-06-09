import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import { PaabHelper } from '../../support/complex/paabHelper';
import { checkHttpError } from '../../support/utils/utilities';
import HttpError from '../../support/utils/HttpError';

describe('multiStep costCenter test', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    ({ pa1Session, rs1Session } = await paabHelper.createResources());
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  async function checkThatRoleCannotAccessCostCenter(
    role: 'researcher' | 'projectAdmin',
    costCenterId: string
  ) {
    console.log(`Check ${role} cannot access cost center`);
    let session: ClientSession;
    if (role === 'researcher') {
      session = rs1Session;
    } else if (role === 'projectAdmin') {
      session = pa1Session;
    } else {
      throw new Error(`Role ${role} is not supported for this test function`);
    }
    try {
      await session.resources.costCenters.costCenter(costCenterId).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
    try {
      await session.resources.costCenters.get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  }

  test('create, get, update, list, delete', async () => {
    console.log('Creating Cost Centers');
    const accountId = setup.getSettings().get('defaultHostingAccountId');
    const { data: createdCostCenterA } = await adminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterA'
    });

    await checkThatRoleCannotAccessCostCenter('researcher', createdCostCenterA);
    await checkThatRoleCannotAccessCostCenter('projectAdmin', createdCostCenterA);

    const { data: createdCostCenterB } = await adminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterB'
    });

    console.log('Get Cost Center A');
    const { data: getCostCenterA } = await adminSession.resources.costCenters
      .costCenter(createdCostCenterA.id)
      .get();
    expect(getCostCenterA).toMatchObject(createdCostCenterA);

    console.log('Search for Cost Center B');
    const { data: listCostCenter } = await adminSession.resources.costCenters.get({
      'filter[name][begins]': 'costCenterB'
    });
    expect(listCostCenter.data.length).toEqual(1);
    expect(listCostCenter.data[0]).toMatchObject(createdCostCenterB);

    console.log('Update Cost Center B');
    const name = 'costCenterB-nameUpdated';
    const description = 'costCenterB-descriptionUpdated';
    const { data: updatedCostCenterB } = await adminSession.resources.costCenters
      .costCenter(createdCostCenterB.id)
      .update({ name, description }, true);
    expect(updatedCostCenterB).toMatchObject({ name, description });

    console.log('Delete Cost Center B');
    // eslint-disable-next-line no-unused-expressions
    expect(await adminSession.resources.costCenters.costCenter(createdCostCenterB.id).delete()).resolves;
  });
});
