import { AssumeRoleCommandInput, AssumeRoleCommandOutput } from '@aws-sdk/client-sts';
import { AwsService } from '@aws/workbench-core-base';
import { ProjectService } from '@aws/workbench-core-environments';
import aws4 from 'aws4';
import { Request as ExpressRequest } from 'express';
import nock from 'nock';
import HPCServiceHelper from './HPCServiceHelper';
import { AwsServiceWithCredentials, Cluster } from './HPCTypes';

describe('HPCServiceHelper', () => {
  const ORIGINAL_ENV = process.env;
  process.env = { ...ORIGINAL_ENV }; // Make a copy
  process.env.AWS_REGION = 'us-east-1';
  process.env.STACK_NAME = 'swb-swbv2-va';
  process.env.PCLUSTER_API_URL = 'abcdefgh.execute-api.us-east-1.amazonaws.com';

  const aws = new AwsService({ region: process.env.AWS_REGION! });

  const assumeRoleInput: AssumeRoleCommandInput = {
    RoleArn: 'arn:aws:iam::123456789012:role/swb-env-mgmt',
    RoleSessionName: 'hpc-service-1234567890123',
    ExternalId: 'externalId'
  };

  const creds: AssumeRoleCommandOutput = {
    Credentials: {
      AccessKeyId: 'ABCDEFGHIJK',
      SecretAccessKey: 'abcdefghijk',
      SessionToken: 'zxcvbnmasdfghjklqwertyuiop'
    }
  } as unknown as AssumeRoleCommandOutput;

  const awsServiceCredentials: AwsServiceWithCredentials = {
    awsService: aws,
    credentials: {
      AccessKeyId: creds.Credentials?.AccessKeyId!,
      SecretAccessKey: creds.Credentials?.SecretAccessKey!,
      SessionToken: creds.Credentials?.SessionToken!
    }
  };

  const clusters: Cluster[] = [
    {
      cloudformationStackArn: 'arn:aws:cloudformation:us-east-1:1234556789:stack/hosting-cluster/0987654321',
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

  const cluster: Cluster = {
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

  const exReq: ExpressRequest = {
    params: {
      projectId: 'proj-123'
    }
  } as unknown as ExpressRequest;

  const awsReq: aws4.Request = {
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

  const projItem = {
    pk: 'PROJ#proj-123',
    sk: 'PROJ#proj-123',
    accountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    accountId: 'acc-123',
    awsAccountId: '123456789012',
    createdAt: '2022-05-18T20:33:42.608Z',
    createdBy: 'abc',
    dependency: 'No dependencies',
    description: 'Example project',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: 'proj-123',
    indexId: 'index-123',
    name: 'Example project',
    owner: 'abc',
    projectAdmins: [],
    resourceType: 'project',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: '2022-05-18T20:33:42.608Z',
    updatedBy: 'abc',
    vpcId: 'vpc-0b0bc7ae01d82e7b3'
  };

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

  aws4.sign = jest.fn().mockReturnValue(awsReq);

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  test('assumeRoleWithCredentials', async () => {
    const hpcHelper = new HPCServiceHelper();
    aws.clients.sts.assumeRole = jest.fn().mockResolvedValue(creds);
    const timestamp = new Date().getTime();
    const assumeRoleParams = {
      aws: aws,
      roleArn: assumeRoleInput.RoleArn!,
      roleSessionName: `hpc-service-${timestamp}`,
      region: process.env.AWS_REGION!,
      externalId: assumeRoleInput.ExternalId
    };

    const response = await hpcHelper.assumeRoleWithCredentials(assumeRoleParams);
    expect(aws.clients.sts.assumeRole).toBeCalledWith({
      RoleArn: assumeRoleParams.roleArn,
      RoleSessionName: assumeRoleParams.roleSessionName,
      ExternalId: assumeRoleParams.externalId
    });
    expect(response.credentials).toEqual(awsServiceCredentials.credentials);
  });

  test('awsAssumeEnvMgt', async () => {
    const hpcHelper = new HPCServiceHelper();
    const projService = new ProjectService({ TABLE_NAME: process.env.STACK_NAME! });
    aws.clients.sts.assumeRole = jest.fn().mockResolvedValue(creds);
    projService.getProject = jest.fn(async () => projItem);

    hpcHelper.aws = aws;
    hpcHelper.projService = projService;
    const response = await hpcHelper.awsAssumeEnvMgt('example-proj');
    expect(response.credentials).toEqual(awsServiceCredentials.credentials);
  });

  test('sendSignedClusterRequest for Listing AWS Clusters', async () => {
    const hpcHelper = new HPCServiceHelper();
    exReq.params.clusterName = undefined!;
    awsReq.path = '/prod/v3/clusters';
    nock(`https://${process.env.PCLUSTER_API_URL}`).get('/prod/v3/clusters').reply(200, {
      clusters
    });

    const response = await hpcHelper.sendSignedClusterRequest(exReq, awsReq);
    expect(response).toEqual(clusters);
  });

  test('sendSignedClusterRequest for Single AWS Cluster', async () => {
    const hpcHelper = new HPCServiceHelper();
    exReq.params.clusterName = 'hosting-cluster';
    awsReq.path = `/prod/v3/clusters/${exReq.params.clusterName}`;
    nock(`https://${process.env.PCLUSTER_API_URL}`)
      .get(`/prod/v3/clusters/${exReq.params.clusterName}`)
      .reply(200, cluster);

    const response = await hpcHelper.sendSignedClusterRequest(exReq, awsReq);
    expect(response).toEqual(cluster);
  });

  test('executeSSMCommand for Seeing Job Queue', async () => {
    const hpcHelper = new HPCServiceHelper();
    hpcHelper.awsAssumeEnvMgt = jest.fn().mockResolvedValue(awsServiceCredentials);

    const executeSSMParams = {
      projectId: 'proj-123',
      instanceId: 'i-0123456789abcdefg',
      slurmCommand: 'squeue',
      slurmFullCommand:
        'squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,start_time,end_time\\}\\)'
    };

    ssm_command.Parameters.commands = [`runuser -l ec2-user -c '${executeSSMParams.slurmFullCommand}'`];

    sendCommandResponse.Command.CommandId = 'JobQueue123';
    ssmStatusCommand.CommandId = 'JobQueue123';
    commandStatusResponse.CommandId = 'JobQueue123';
    commandStatusResponse.StandardOutputContent =
      '[\n  {\n    "name": "test",\n    "nodes": "queue0-dy-queue0-c5xlarge-1",\n    "partition": "queue0",\n    "job_state": "CANCELLED",\n    "job_id": 1,\n    "start_time": 1234567890,\n    "end_time": 1234567891\n  }\n]\n';

    aws.clients.ssm.sendCommand = jest.fn().mockResolvedValue(sendCommandResponse);
    aws.clients.ssm.getCommandInvocation = jest.fn().mockResolvedValue(commandStatusResponse);

    hpcHelper.aws = aws;
    const response = await hpcHelper.executeSSMCommand(
      executeSSMParams.projectId,
      executeSSMParams.instanceId,
      executeSSMParams.slurmCommand,
      executeSSMParams.slurmFullCommand
    );
    commandStatusResponse.StandardOutputContent = JSON.parse(commandStatusResponse.StandardOutputContent);

    expect(aws.clients.ssm.sendCommand).toBeCalledWith(ssm_command);
    expect(aws.clients.ssm.getCommandInvocation).toBeCalledWith(ssmStatusCommand);
    expect(response).toEqual(commandStatusResponse);
  });

  test('executeSSMCommand for Sending a Job', async () => {
    const hpcHelper = new HPCServiceHelper();
    hpcHelper.awsAssumeEnvMgt = jest.fn().mockResolvedValue(awsServiceCredentials);

    const jobParams = {
      command: '/home/ec2-user/test.sh',
      job_name: 'test',
      nodes: 1,
      ntasks: 1,
      partition: 'queue0'
    };

    const executeSSMParams = {
      projectId: 'proj-123',
      instanceId: 'i-0123456789abcdefg',
      slurmCommand: 'sbatch',
      slurmFullCommand: `sbatch --job-name ${jobParams.job_name} --nodes ${jobParams.nodes} --ntasks ${jobParams.ntasks}  --partition ${jobParams.partition} ${jobParams.command}`
    };

    ssm_command.Parameters.commands = [`runuser -l ec2-user -c '${executeSSMParams.slurmFullCommand}'`];

    sendCommandResponse.Command.CommandId = 'JobQueue123';
    ssmStatusCommand.CommandId = 'JobQueue123';
    commandStatusResponse.CommandId = 'JobQueue123';
    commandStatusResponse.StandardOutputContent = 'Submitted batch job 1\n';

    aws.clients.ssm.sendCommand = jest.fn().mockResolvedValue(sendCommandResponse);
    aws.clients.ssm.getCommandInvocation = jest.fn().mockResolvedValue(commandStatusResponse);

    hpcHelper.aws = aws;
    const response = await hpcHelper.executeSSMCommand(
      executeSSMParams.projectId,
      executeSSMParams.instanceId,
      executeSSMParams.slurmCommand,
      executeSSMParams.slurmFullCommand
    );
    expect(aws.clients.ssm.sendCommand).toBeCalledWith(ssm_command);
    expect(aws.clients.ssm.getCommandInvocation).toBeCalledWith(ssmStatusCommand);
    expect(response).toEqual(commandStatusResponse);
  });

  test('executeSSMCommand for Canceling a Job', async () => {
    const hpcHelper = new HPCServiceHelper();
    hpcHelper.awsAssumeEnvMgt = jest.fn().mockResolvedValue(awsServiceCredentials);

    const executeSSMParams = {
      projectId: 'proj-123',
      instanceId: 'i-0123456789abcdefg',
      slurmCommand: 'scancel',
      slurmFullCommand: `scancel 1`
    };

    ssm_command.Parameters.commands = [`runuser -l ec2-user -c '${executeSSMParams.slurmFullCommand}'`];

    sendCommandResponse.Command.CommandId = 'JobQueue123';
    ssmStatusCommand.CommandId = 'JobQueue123';
    commandStatusResponse.CommandId = 'JobQueue123';
    commandStatusResponse.StandardOutputContent = '';

    aws.clients.ssm.sendCommand = jest.fn().mockResolvedValue(sendCommandResponse);
    aws.clients.ssm.getCommandInvocation = jest.fn().mockResolvedValue(commandStatusResponse);

    hpcHelper.aws = aws;
    const response = await hpcHelper.executeSSMCommand(
      executeSSMParams.projectId,
      executeSSMParams.instanceId,
      executeSSMParams.slurmCommand,
      executeSSMParams.slurmFullCommand
    );
    expect(aws.clients.ssm.sendCommand).toBeCalledWith(ssm_command);
    expect(aws.clients.ssm.getCommandInvocation).toBeCalledWith(ssmStatusCommand);
    expect(response).toEqual(commandStatusResponse);
  });
});
