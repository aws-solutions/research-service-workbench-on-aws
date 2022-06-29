import { AwsService } from '@amzn/workbench-core-base';
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import aws4 from 'aws4';
import { Request as ExpressRequest } from 'express';
import HPC, { AwsServiceWithCredentials, Cluster } from './HPC';

describe('HPC', () => {
  const ORIGINAL_ENV = process.env;
  let awsServiceCredentials: AwsServiceWithCredentials;
  let Clusters: Cluster[];
  let Cluster: Cluster;
  let awsReq: aws4.Request;
  let exReq: ExpressRequest;

  const ssm_command = {
    InstanceIds: ['i-0123456789abcdefg'],
    DocumentName: 'AWS-RunShellScript',
    Comment: 'Run ssm command.',
    Parameters: {
      commands: [`runuser -l ec2-user -c 'BLANK COMMAND'`]
    }
  };

  const sendCommandResponse = {
    Command: {
      CommandId: 'BLANK COMMAND'
    }
  };

  const ssmStatusCommand = {
    CommandId: 'BLANK COMMAND',
    InstanceId: 'i-0123456789abcdefg'
  };

  const commandStatusResponse = {
    CommandId: 'BLANK COMMAND',
    InstanceId: 'i-0123456789abcdefg',
    ResponseCode: 0,
    StandardOutputContent: 'BLANK OUTPUT',
    Status: 'Success',
    StatusDetails: 'Success'
  };

  const mockSSM = mockClient(SSMClient);

  beforeAll(() => {
    awsServiceCredentials = {
      awsService: new AwsService({ region: process.env.AWS_REGION! }),
      credentials: {
        AccessKeyId: 'ABCDEFGHIJK',
        SecretAccessKey: 'abcdefghijk',
        SessionToken: 'zxcvbnmasdfghjklqwertyuiop'
      }
    };
    Clusters = [
      {
        cloudformationStackArn:
          'arn:aws:cloudformation:us-east-1:1234556789:stack/hosting-cluster/0987654321',
        clusterName: 'hosting-cluster',
        region: 'us-east-1',
        version: '3.1.4'
      },
      {
        cloudformationStackArn: 'arn:aws:cloudformation:us-east-1:1234556789:stack/other-cluster/00000012345',
        clusterName: 'other-cluster',
        region: 'us-east-1',
        version: '3.1.4'
      }
    ];
    Cluster = {
      cloudformationStackArn: 'arn:aws:cloudformation:us-east-1:1234556789:stack/hosting-cluster/0987654321',
      clusterName: 'hosting-cluster',
      creationTime: '2022-01-01T12:00:00.000Z',
      headNode: {
        instanceId: 'i-0123456789abcdefg',
        instanceType: 't2.medium',
        launchTime: '2022-01-02T12:00:00.000Z',
        privateIpAddress: '10.0.00.00',
        publicIpAddress: '18.000.000.00',
        state: 'running'
      },
      region: 'us-east-1',
      version: '3.1.4'
    };
    awsReq = {
      host: process.env.PCLUSTER_API_URL,
      service: 'execute-api',
      region: process.env.AWS_REGION,
      method: 'GET',
      path: '/prod/v3/clusters',
      headers: {
        Host: process.env.PCLUSTER_API_URL,
        'X-Amz-Security-Token': 'ABCDEFGHIJKLMNOP',
        'X-Amz-Date': '20220101T120000Z',
        Authorization: 'AWS4-HMAC-SHA256 Credential=LongCredential'
      }
    };
    aws4.sign = jest.fn().mockReturnValue(awsReq);
  });

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.PCLUSTER_API_URL = 'abcdefgh.execute-api.us-east-1.amazonaws.com';
    exReq = {
      params: {
        projectId: 'proj-123'
      }
    } as unknown as ExpressRequest;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  test('getAwsCluster for Cluster List', async () => {
    const mainHPC = new HPC();

    mainHPC['_awsAssumeEnvMgt'] = jest.fn().mockResolvedValue(awsServiceCredentials);

    mainHPC['_sendSignedClusterRequest'] = jest.fn().mockResolvedValue(Clusters);

    const response = await mainHPC.getAwsCluster(exReq);

    expect(response).toEqual(Clusters);
  });

  test('getAwsCluster for Single Cluster', async () => {
    const mainHPC = new HPC();

    mainHPC['_awsAssumeEnvMgt'] = jest.fn().mockResolvedValue(awsServiceCredentials);

    mainHPC['_sendSignedClusterRequest'] = jest.fn().mockResolvedValue(Cluster);

    exReq.params.clusterName = 'hosting-cluster';

    const response = await mainHPC.getAwsCluster(exReq);

    expect(response).toEqual(Cluster);
  });

  test('jobQueue for Seeing Job Queue', async () => {
    const mainHPC = new HPC();

    mainHPC['_awsAssumeEnvMgt'] = jest.fn().mockResolvedValue(awsServiceCredentials);

    exReq.params.clusterName = 'hosting-cluster';

    exReq.params.instanceId = 'i-0123456789abcdefg';

    ssm_command.Parameters.commands = [
      `runuser -l ec2-user -c 'squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,start_time,end_time\\}\\)'`
    ];

    sendCommandResponse.Command.CommandId = 'JobQueue123';

    ssmStatusCommand.CommandId = 'JobQueue123';

    commandStatusResponse.CommandId = 'JobQueue123';

    commandStatusResponse.StandardOutputContent =
      '[\n  {\n    "name": "test",\n    "nodes": "queue0-dy-queue0-c5xlarge-1",\n    "partition": "queue0",\n    "job_state": "CANCELLED",\n    "job_id": 1,\n    "start_time": 1234567890,\n    "end_time": 1234567891\n  }\n]\n';

    mockSSM.on(SendCommandCommand, ssm_command).resolves(sendCommandResponse);
    mockSSM.on(GetCommandInvocationCommand, ssmStatusCommand).resolves(commandStatusResponse);

    const response = await mainHPC.jobQueue(exReq);

    commandStatusResponse.StandardOutputContent = JSON.parse(commandStatusResponse.StandardOutputContent);

    expect(response).toEqual(commandStatusResponse);
  });

  test('submitJob for Sending a Job', async () => {
    const mainHPC = new HPC();

    mainHPC['_awsAssumeEnvMgt'] = jest.fn().mockResolvedValue(awsServiceCredentials);

    exReq.params.clusterName = 'hosting-cluster';

    exReq.params.instanceId = 'i-0123456789abcdefg';

    exReq.body = {
      command: '/home/ec2-user/test.sh',
      job_name: 'test',
      nodes: 1,
      ntasks: 1,
      partition: 'queue0'
    };

    ssm_command.Parameters.commands = [
      `runuser -l ec2-user -c 'sbatch --job-name ${exReq.body.job_name} --nodes ${exReq.body.nodes} --ntasks ${exReq.body.ntasks}  --partition ${exReq.body.partition} ${exReq.body.command}'`
    ];

    sendCommandResponse.Command.CommandId = 'JobQueue123';

    ssmStatusCommand.CommandId = 'JobQueue123';

    commandStatusResponse.CommandId = 'JobQueue123';

    commandStatusResponse.StandardOutputContent = 'Submitted batch job 1\n';

    mockSSM.on(SendCommandCommand, ssm_command).resolves(sendCommandResponse);
    mockSSM.on(GetCommandInvocationCommand, ssmStatusCommand).resolves(commandStatusResponse);

    const response = await mainHPC.submitJob(exReq);

    expect(response).toEqual(commandStatusResponse);
  });

  test('cancelJob for Canceling a Job', async () => {
    const mainHPC = new HPC();

    mainHPC['_awsAssumeEnvMgt'] = jest.fn().mockResolvedValue(awsServiceCredentials);

    exReq.params.clusterName = 'hosting-cluster';

    exReq.params.instanceId = 'i-0123456789abcdefg';

    exReq.params.jobId = '1';

    ssm_command.Parameters.commands = [`runuser -l ec2-user -c 'scancel 1'`];

    sendCommandResponse.Command.CommandId = 'JobQueue123';

    ssmStatusCommand.CommandId = 'JobQueue123';

    commandStatusResponse.CommandId = 'JobQueue123';

    commandStatusResponse.StandardOutputContent = '';

    mockSSM.on(SendCommandCommand, ssm_command).resolves(sendCommandResponse);
    mockSSM.on(GetCommandInvocationCommand, ssmStatusCommand).resolves(commandStatusResponse);

    const response = await mainHPC.cancelJob(exReq);

    expect(response).toEqual(commandStatusResponse);
  });
});
