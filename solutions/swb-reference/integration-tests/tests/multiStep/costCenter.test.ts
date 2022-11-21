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
    // Create Cost Center
    console.log('Creating Cost Centers');
    const accountId = setup.getSettings().get('defaultHostingAccountId');
    // const { data: createdCostCenterA } = await adminSession.resources.costCenters.create({ accountId, name: 'costCenterA' });
    // console.log('response', createdCostCenterA);
    const { data: createdCostCenterA } = await adminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterA'
    });
    console.log('createdCostCenterA', createdCostCenterA);

    const { data: createdCostCenterB } = await adminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterB'
    });
    console.log('createdCostCenterB', createdCostCenterB);

    console.log('Get Cost Center A');
    const { data: getCostCenterA } = await adminSession.resources.costCenters
      .costCenter(createdCostCenterA.id)
      .get();
    expect(createdCostCenterA).toMatchObject(getCostCenterA);

    console.log('Search for Cost Center B');
    const {
      data: [listCostCenterB]
    } = await adminSession.resources.costCenters.get({ 'filter[name][begins]': 'costCenterB' });
    expect(listCostCenterB).toMatchObject(createdCostCenterB);
  });
});
