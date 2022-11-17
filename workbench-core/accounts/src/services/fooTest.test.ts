import { AwsService } from '@aws/workbench-core-base';
import { DeleteCostCenterRequestParser } from '../models/costCenters/deleteCostCenterRequest';
import CostCenterService from './costCenterService';

describe('fooTest', () => {
  const tableName = 'swb-dev1-sto';
  const aws: AwsService = new AwsService({
    region: 'eu-north-1',
    ddbTableName: tableName
  });

  const costCenterService = new CostCenterService(
    {
      TABLE_NAME: tableName
    },
    aws.helpers.ddb
  );
  test('foo', async () => {
    // const costCenterId = 'cc-3e8ac77c-2417-4c65-be86-86c807d3612a';
    const costCenterId = 'abc';
    const data = await costCenterService._doesCostCenterHaveProjects(costCenterId);
    console.log('data stuff', data);
    expect(true).toEqual(true);
  });

  test('softDelete', async () => {
    // const costCenterId = 'cc-3e8ac77c-2417-4c65-be86-86c807d3612a';
    const costCenterId = 'abc';
    const request = DeleteCostCenterRequestParser.parse({ id: costCenterId });
    const data = await costCenterService.softDeleteCostCenter(request);
    console.log('data stuff', data);
    expect(true).toEqual(true);
  });
});
