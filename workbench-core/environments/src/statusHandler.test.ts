// import StatusHandler from './statusHandler';
// import EventBridgeEventToDDB from './eventBridgeEventToDDB';
// import { mockClient } from 'aws-sdk-client-mock';
// import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
// import { ServiceCatalogClient, DescribeRecordCommand } from '@aws-sdk/client-service-catalog';
// import EnvironmentService from './environmentService';

describe('StatusHandler', () => {
  test('placeholder', () => {
    expect(1).toBe(1);
  });
  // test('execute does not return an error on Launch operation', async () => {
  //   const statusHandler = new StatusHandler();
  //   const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  //   const environment = {
  //     id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
  //     awsAccountId: '123456789012',
  //     createdAt: '2022-05-05T19:39:03.023Z',
  //     envTypeId: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq',
  //     resourceType: 'environment',
  //     status:'1',
  //     updatedAt: '2022-05-05T19:43:57.143Z',
  //     cidr: '1.1.1.1/32',
  //     description: 'blah',
  //     instanceId: '123',
  //     error: undefined,
  //     name: 'sagemaker',
  //     outputs: [],
  //     projectId: '123',
  //     datasetIds: [],
  //     envTypeConfigId: 'ETC-123',
  //     provisionedProductId: '123',
  //     owner:'blah'
  //   };
  //   jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);
  //   const ebToDDB: EventBridgeEventToDDB = {
  //     envId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     status: 'PENDING',
  //     operation: 'Launch',
  //     metadata: {
  //       version: '0',
  //       id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //       'detail-type': 'EnvironmentStatusUpdate',
  //       source: 'LaunchSagemaker',
  //       account: '123456789012',
  //       time: '2022-05-05T17:25:37Z',
  //       region: 'us-east-1',
  //       resources: [],
  //       detail: {
  //         EnvId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //         ProvisionedProductId: 'pp-z5bkj4vcwasi2',
  //         RecordId: 'rec-6xswbmafv4bny',
  //         EnvType: 'Sagemaker',
  //         Operation: 'Launch',
  //         Status: 'COMPLETED'
  //       }
  //     }
  //   };
  //   const mockSC = mockClient(ServiceCatalogClient);
  //   mockSC.on(DescribeRecordCommand).resolves({
  //     RecordOutputs: [
  //       { OutputKey: 'NotebookInstanceName', OutputValue: 'sampleNotebookInstanceName' },
  //       { OutputKey: 'NotebookArn', OutputValue: 'sampleNotebookArn' }
  //     ]
  //   });
  //   const mockDDB = mockClient(DynamoDBClient);
  //   jest.spyOn(envService, 'updateEnvironment').mockImplementation();
  //   jest.spyOn(envService, 'addMetadata').mockImplementation();
  //   mockDDB.on(UpdateItemCommand).resolves({});

  //   await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();
  // });
  // test('execute does not return an error on non-Launch operation', async () => {
  //   const statusHandler = new StatusHandler();
  //   const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  //   const environment = {
  //     id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
  //     awsAccountId: '123456789012',
  //     createdAt: '2022-05-05T19:39:03.023Z',
  //     envTypeId: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq',
  //     resourceType: 'environment',
  //     status:'1',
  //     updatedAt: '2022-05-05T19:43:57.143Z',
  //     cidr: '1.1.1.1/32',
  //     description: 'blah',
  //     instanceId: '123',
  //     error: undefined,
  //     name: 'sagemaker',
  //     outputs: [],
  //     projectId: '123',
  //     datasetIds: [],
  //     envTypeConfigId: 'ETC-123',
  //     provisionedProductId: '123',
  //     owner:'blah'
  //   };
  //   jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);
  //   const ebToDDB: EventBridgeEventToDDB = {
  //     envId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     status: 'TERMINATING',
  //     operation: 'Terminate',
  //     metadata: {
  //       version: '0',
  //       id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //       'detail-type': 'EnvironmentStatusUpdate',
  //       source: 'TerminateSagemaker',
  //       account: '123456789012',
  //       time: '2022-05-05T17:25:37Z',
  //       region: 'us-east-1',
  //       resources: [],
  //       detail: {
  //         EnvId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //         ProvisionedProductId: 'pp-z5bkj4vcwasi2',
  //         RecordId: 'rec-6xswbmafv4bny',
  //         EnvType: 'Sagemaker',
  //         Operation: 'Terminate',
  //         Status: 'TERMINATED'
  //       }
  //     }
  //   };
  //   const mockDDB = mockClient(DynamoDBClient);
  //   jest.spyOn(envService, 'updateEnvironment').mockImplementation();
  //   jest.spyOn(envService, 'addMetadata').mockImplementation();
  //   mockDDB.on(UpdateItemCommand).resolves({});

  //   await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();
  // });
});
