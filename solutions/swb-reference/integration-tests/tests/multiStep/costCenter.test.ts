import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep costCenter test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('create, get, update, list, delete', async () => {
    console.log('Creating Cost Centers');
    const accountId = setup.getSettings().get('defaultHostingAccountId');
    const { data: createdCostCenterA } = await adminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterA'
    });

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
