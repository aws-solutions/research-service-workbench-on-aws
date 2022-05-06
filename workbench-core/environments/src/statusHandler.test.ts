import StatusHandler from './statusHandler';
import EventBridgeEventToDDB from './eventBridgeEventToDDB';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { ServiceCatalogClient, DescribeRecordCommand } from '@aws-sdk/client-service-catalog';

describe('StatusHandler', () => {
  test('execute does not return an error on Launch operation', async () => {
    const statusHandler = new StatusHandler();
    const ebToDDB: EventBridgeEventToDDB = {
      envId: 'abc',
      status: 'PENDING',
      operation: 'Launch',
      metadata: {
        version: '0',
        id: '80134f4a-6d5c-ddfb-8340-3f78991ff1a9',
        'detail-type': 'EnvironmentStatusUpdate',
        source: 'LaunchSagemaker',
        account: '123456789012',
        time: '2022-05-05T17:25:37Z',
        region: 'us-east-1',
        resources: [],
        detail: {
          EnvId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
          ProvisionedProductId: 'pp-z5bkj4vcwasi2',
          RecordId: 'rec-6xswbmafv4bny',
          EnvType: 'Sagemaker',
          Operation: 'Launch',
          Status: 'COMPLETED'
        }
      }
    };
    const mockSC = mockClient(ServiceCatalogClient);
    mockSC.on(DescribeRecordCommand).resolves({
      RecordOutputs: [
        { OutputKey: 'NotebookInstanceName', OutputValue: 'sampleNotebookInstanceName' },
        { OutputKey: 'NotebookArn', OutputValue: 'sampleNotebookArn' }
      ]
    });
    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        sk: {
          S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        accountId: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        },
        createdAt: {
          S: '2022-05-05T19:39:03.023Z'
        },
        envTypeId: {
          S: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq'
        },
        id: {
          S: '6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        resourceType: {
          S: 'environment'
        },
        status: {
          N: '1'
        },
        updatedAt: {
          S: '2022-05-05T19:43:57.143Z'
        }
      }
    });

    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();
  });
  test('execute does not return an error on non-Launch operation', async () => {
    const statusHandler = new StatusHandler();
    const ebToDDB: EventBridgeEventToDDB = {
      envId: 'abc',
      status: 'PENDING',
      operation: 'Terminate',
      metadata: {
        version: '0',
        id: '80134f4a-6d5c-ddfb-8340-3f78991ff1a9',
        'detail-type': 'EnvironmentStatusUpdate',
        source: 'LaunchSagemaker',
        account: '123456789012',
        time: '2022-05-05T17:25:37Z',
        region: 'us-east-1',
        resources: [],
        detail: {
          EnvId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
          ProvisionedProductId: 'pp-z5bkj4vcwasi2',
          RecordId: 'rec-6xswbmafv4bny',
          EnvType: 'Sagemaker',
          Operation: 'Launch',
          Status: 'COMPLETED'
        }
      }
    };
    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        sk: {
          S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        accountId: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        },
        createdAt: {
          S: '2022-05-05T19:39:03.023Z'
        },
        envTypeId: {
          S: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq'
        },
        id: {
          S: '6e185c8c-caeb-4305-8f08-d408b316dca7'
        },
        resourceType: {
          S: 'environment'
        },
        status: {
          N: '1'
        },
        updatedAt: {
          S: '2022-05-05T19:43:57.143Z'
        }
      }
    });

    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();
  });
});
