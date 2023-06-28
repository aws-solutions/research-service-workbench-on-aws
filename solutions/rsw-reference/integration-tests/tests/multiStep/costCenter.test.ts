import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep costCenter test', () => {
  const setup: Setup = Setup.getSetup();
  let itAdminSession: ClientSession;

  beforeAll(async () => {
    itAdminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('create, get, update, list, delete', async () => {
    console.log('Creating Cost Centers');
    const accountId = setup.getSettings().get('defaultHostingAccountId');
    const createCostCenterAResponse = await itAdminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterA'
    });
    expect(createCostCenterAResponse.status).toEqual(201);

    const createCostCenterBResponse = await itAdminSession.resources.costCenters.create({
      accountId,
      name: 'costCenterB'
    });
    expect(createCostCenterBResponse.status).toEqual(201);

    const costCenterA = createCostCenterAResponse.data;
    const costCenterB = createCostCenterBResponse.data;

    console.log('Get Cost Center A');
    const responseCostCenterA = await itAdminSession.resources.costCenters.costCenter(costCenterA.id).get();
    expect(responseCostCenterA.status).toEqual(200);

    const getCostCenterA = responseCostCenterA.data;
    expect(getCostCenterA).toMatchObject(costCenterA);

    console.log('Search for Cost Center B');
    const responseCostCenterB = await itAdminSession.resources.costCenters.get({
      'filter[name][begins]': 'costCenterB'
    });
    expect(responseCostCenterB.status).toEqual(200);

    const listCostCenter = responseCostCenterB.data;
    expect(listCostCenter.data.length).toEqual(1);
    expect(listCostCenter.data[0]).toMatchObject(costCenterB);

    console.log('Update Cost Center B');
    const name = 'costCenterB-nameUpdated';
    const description = 'costCenterB-descriptionUpdated';
    const response = await itAdminSession.resources.costCenters
      .costCenter(costCenterB.id)
      .update({ name, description }, true);
    expect(response.status).toEqual(200);

    const updatedCostCenterB = response.data;
    expect(updatedCostCenterB).toMatchObject({ name, description });

    console.log('Delete Cost Center B');
    const deleteResponse = await itAdminSession.resources.costCenters.costCenter(costCenterB.id).delete();
    expect(deleteResponse.status).toEqual(204);
  });
});
