import { AwsService } from '@amzn/workbench-core-base';
import { ServiceCatalogClient, DescribeRecordCommand } from '@aws-sdk/client-service-catalog';
import { mockClient } from 'aws-sdk-client-mock';
import EventBridgeEventToDDB from '../interfaces/eventBridgeEventToDDB';
import { EnvironmentService, Environment } from '../services/environmentService';
import EnvironmentLifecycleHelper from '../utilities/environmentLifecycleHelper';
import StatusHandler from './statusHandler';

describe('StatusHandler', () => {
  const ORIGINAL_ENV = process.env;
  let environment: Environment;
  let ebToDDB: EventBridgeEventToDDB;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.AWS_REGION = 'us-east-1';
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDoc';
    ebToDDB = {
      envId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
      status: 'TERMINATING',
      operation: 'Terminate',
      metadata: {
        version: '0',
        id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
        'detail-type': 'EnvironmentStatusUpdate',
        source: 'TerminateSagemaker',
        account: '123456789012',
        time: '2022-05-05T17:25:37Z',
        region: 'us-east-1',
        resources: [],
        detail: {
          EnvId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
          ProvisionedProductId: 'pp-z5bkj4vcwasi2',
          RecordId: 'rec-6xswbmafv4bny',
          EnvType: 'Sagemaker',
          Operation: 'Terminate',
          Status: 'TERMINATING'
        }
      }
    };
    environment = {
      id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
      createdAt: '2022-05-05T19:39:03.023Z',
      status: 'PENDING',
      updatedAt: '2022-05-05T16:43:57.143Z',
      cidr: '1.1.1.1/32',
      description: 'blah',
      instanceId: '123',
      error: undefined,
      name: 'sagemaker',
      outputs: [],
      projectId: '123',
      PROJ: { envMgmtRoleArn: 'sampleEnvMgmtRoleArn' },
      datasetIds: [],
      envTypeConfigId: 'ETC-123',
      provisionedProductId: '123',
      owner: 'blah',
      type: 'testEnvType',
      dependency: '123',
      updatedBy: 'blah',
      createdBy: 'blah'
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });
  test('execute short-circuits if event does not contain a valid status', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    ebToDDB.status = 'INVALID_STATUS';
    envService.getEnvironment = jest.fn();
    envService.updateEnvironment = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).not.toBeCalled();
    expect(envService.updateEnvironment).not.toBeCalled();
  });

  test('execute short-circuits if event does not contain envId nor instanceId', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    ebToDDB.envId = undefined;
    ebToDDB.instanceId = undefined;
    envService.getEnvironment = jest.fn();
    envService.updateEnvironment = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).not.toBeCalled();
    expect(envService.updateEnvironment).not.toBeCalled();
  });

  test('execute does not return an error on Launch operation even when event older than last update', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const environmentLifecycleHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });

    const ebToDDB: EventBridgeEventToDDB = {
      envId: '6e185c8c-caeb-4305-8f08-d408b316dca7',
      status: 'COMPLETED',
      operation: 'Launch',
      recordOutputKeys: { instanceName: 'NotebookInstanceName', instanceArn: 'NotebookArn' },
      metadata: {
        version: '0',
        id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
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
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    environmentLifecycleHelper.getAwsSdkForEnvMgmtRole = jest.fn(
      async () => new AwsService({ region: 'us-east-1' })
    );
    statusHandler['_getEnvService'] = jest.fn(() => envService);
    statusHandler['_getEnvHelper'] = jest.fn(() => environmentLifecycleHelper);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(2);
    expect(envService.addMetadata).toBeCalledTimes(2);
  });

  test('execute does not return an error on Launch operation when envId not present in event', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const environmentLifecycleHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });

    const ebToDDB: EventBridgeEventToDDB = {
      status: 'COMPLETED',
      operation: 'Launch',
      instanceId: 'notebookInstance-abc',
      recordOutputKeys: { instanceName: 'NotebookInstanceName', instanceArn: 'NotebookArn' },
      metadata: {
        version: '0',
        id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
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
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    environmentLifecycleHelper.getAwsSdkForEnvMgmtRole = jest.fn(
      async () => new AwsService({ region: 'us-east-1' })
    );
    statusHandler['_getEnvService'] = jest.fn(() => envService);
    statusHandler['_getEnvHelper'] = jest.fn(() => environmentLifecycleHelper);
    statusHandler['_getEnvId'] = jest.fn().mockResolvedValue('6e185c8c-caeb-4305-8f08-d408b316dca7');

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(2);
    expect(envService.addMetadata).toBeCalledTimes(2);
  });

  test('execute updates with recent status on non-Launch operation', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.status = 'COMPLETED';
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledWith('6e185c8c-caeb-4305-8f08-d408b316dca7', {
      status: 'TERMINATING'
    });
  });

  test('execute updates with failure status', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.status = 'COMPLETED';
    ebToDDB.errorMsg = 'Instance ran into error and cannot be terminated';
    ebToDDB.status = 'TERMINATING_FAILED';
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledWith('6e185c8c-caeb-4305-8f08-d408b316dca7', {
      status: ebToDDB.status,
      error: { value: ebToDDB.errorMsg, type: 'TERMINATE' }
    });
  });

  test('execute skips update if env status same as event status during a non-Launch event', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.status = 'TERMINATING';

    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(0);
  });

  test('execute skips update if event is older than last update time during a non-Launch event', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.status = 'COMPLETED';
    environment.updatedAt = '2022-05-05T19:43:57.143Z';

    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    statusHandler['_getEnvService'] = jest.fn(() => envService);

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(0);
  });

  test('execute does not skip update on Launch operation if env status same as event status', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const environmentLifecycleHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.status = 'COMPLETED';

    const ebToDDB: EventBridgeEventToDDB = {
      status: 'COMPLETED',
      operation: 'Launch',
      instanceId: 'notebookInstance-abc',
      recordOutputKeys: { instanceName: 'NotebookInstanceName', instanceArn: 'NotebookArn' },
      metadata: {
        version: '0',
        id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
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
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    environmentLifecycleHelper.getAwsSdkForEnvMgmtRole = jest.fn(
      async () => new AwsService({ region: 'us-east-1' })
    );
    statusHandler['_getEnvService'] = jest.fn(() => envService);
    statusHandler['_getEnvHelper'] = jest.fn(() => environmentLifecycleHelper);
    statusHandler['_getEnvId'] = jest.fn().mockResolvedValue('6e185c8c-caeb-4305-8f08-d408b316dca7');

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(2);
    expect(envService.addMetadata).toBeCalledTimes(2);
  });

  test('execute does not skip update on Launch operation if event earlier than last ddb update', async () => {
    // BUILD
    const statusHandler = new StatusHandler();
    const environmentLifecycleHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    environment.updatedAt = '2022-05-05T19:43:57.143Z';

    const ebToDDB: EventBridgeEventToDDB = {
      status: 'COMPLETED',
      operation: 'Launch',
      instanceId: 'notebookInstance-abc',
      recordOutputKeys: { instanceName: 'NotebookInstanceName', instanceArn: 'NotebookArn' },
      metadata: {
        version: '0',
        id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
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
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    envService.addMetadata = jest.fn();
    environmentLifecycleHelper.getAwsSdkForEnvMgmtRole = jest.fn(
      async () => new AwsService({ region: 'us-east-1' })
    );
    statusHandler['_getEnvService'] = jest.fn(() => envService);
    statusHandler['_getEnvHelper'] = jest.fn(() => environmentLifecycleHelper);
    statusHandler['_getEnvId'] = jest.fn().mockResolvedValue('6e185c8c-caeb-4305-8f08-d408b316dca7');

    // OPERATE
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();

    // CHECK
    expect(envService.getEnvironment).toBeCalledTimes(1);
    expect(envService.updateEnvironment).toBeCalledTimes(2);
    expect(envService.addMetadata).toBeCalledTimes(2);
  });
});
