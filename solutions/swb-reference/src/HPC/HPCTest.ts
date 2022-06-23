/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { IncomingMessage } from 'http';
import https from 'https';
import { ProjectService } from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';
import aws4 from 'aws4';
import { Request } from 'express';

interface JobParameters {
  command: string;
  job_name: string;
  nodes: number;
  ntasks: number;
  partition: string;
}

interface AwsServiceWithCredentials {
  awsService: AwsService;
  credentials: {
    AccessKeyId: string;
    SecretAccessKey: string;
    SessionToken: string;
  };
}

interface SSMCommandStatus {
  CommandId: string;
  InstanceId: string;
  ResponseCode: number;
  StandardOutputContent: Record<string, string>;
  Status: string;
  StatusDetails: string;
}

interface Cluster {
  cloudformationStackArn: string;
  clusterName: string;
  creationTime: string;
  headNode?: {
    instanceId: string;
    instanceType: string;
    launchTime: string;
    privateIpAddress: string;
    publicIpAddress: string;
    state: string;
  };
  region: string;
  version: string;
}

export default class HPCTest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async assumeRoleWithCredentials(params: {
    aws: AwsService;
    roleArn: string;
    roleSessionName: string;
    externalId?: string;
    region: string;
  }): Promise<AwsServiceWithCredentials> {
    const { Credentials } = await params.aws.clients.sts.assumeRole({
      RoleArn: params.roleArn,
      RoleSessionName: params.roleSessionName,
      ExternalId: params.externalId
    });
    if (Credentials) {
      const awsServiceCredentials = {
        awsService: new AwsService({
          region: params.region,
          credentials: {
            accessKeyId: Credentials.AccessKeyId!,
            secretAccessKey: Credentials.SecretAccessKey!,
            sessionToken: Credentials.SessionToken!
          }
        }),
        credentials: Credentials
      };
      return awsServiceCredentials as AwsServiceWithCredentials;
    } else {
      throw new Error(`Unable to assume role with params: ${params}`);
    }
  }

  public async awsAssumeEnvMgt(projectId: string): Promise<AwsServiceWithCredentials> {
    const aws = new AwsService({ region: process.env.AWS_REGION! });

    const timestamp = new Date().getTime();

    const projService = new ProjectService({ TABLE_NAME: process.env.STACK_NAME! });

    const projItem = await projService.getProject(projectId);

    const assumeRoleParams = {
      aws: aws,
      roleArn: projItem.envMgmtRoleArn,
      roleSessionName: `aws_session_env_mgt_${timestamp}`,
      region: process.env.AWS_REGION!,
      externalId: projItem.externalId
    };

    const envMgtAWS = await this.assumeRoleWithCredentials(assumeRoleParams);

    return envMgtAWS;
  }

  public async getAwsCluster(req: Request): Promise<Cluster | Cluster[]> {
    const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const opts = {
      host: process.env.PCLUSTER_API_URL!,
      service: 'execute-api',
      region: 'us-east-1',
      method: 'GET',
      path: '/prod/v3/clusters'
    };

    if (req.params.clusterName) {
      opts.path = `/prod/v3/clusters/${req.params.clusterName}`;
    }

    const secs = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed: aws4.Request = aws4.sign(opts, secs);

    return new Promise((resolve, reject) => {
      const https_req = https.request(signed, function (res: IncomingMessage) {
        let response_body = '';
        res.on('data', (chunk: string) => {
          response_body += chunk;
        });
        res.on('end', () => {
          if (req.params.clusterName) {
            const body = JSON.parse(response_body);
            const cluster: Cluster = {
              cloudformationStackArn: body.cloudformationStackArn,
              clusterName: body.clusterName,
              creationTime: body.creationTime,
              headNode: body.headNode,
              region: body.region,
              version: body.version
            };
            resolve(cluster);
          } else {
            const body = JSON.parse(response_body);
            const clusterList: Cluster[] = body.clusters as Cluster[];
            resolve(clusterList);
          }
        });
      });
      https_req.on('error', (err: string) => {
        reject(err);
      });
      https_req.end();
    });
  }

  public async performSSMCommand(
    projectId: string,
    instanceId: string,
    slurmCommand: string,
    slurmFullCommand: string
  ): Promise<SSMCommandStatus> {
    const awsEnvMgt = await this.awsAssumeEnvMgt(projectId);

    const ssm_command = {
      InstanceIds: [instanceId],
      DocumentName: 'AWS-RunShellScript',
      Comment: 'Run ssm command.',
      Parameters: {
        commands: [`runuser -l ec2-user -c '${slurmFullCommand}'`]
      }
    };

    console.log(JSON.stringify(ssm_command));

    const sendCommandResponse = await awsEnvMgt.awsService.clients.ssm.sendCommand(ssm_command);

    const ssmStatusCommand = {
      CommandId: sendCommandResponse.Command?.CommandId,
      InstanceId: instanceId
    };

    function sleep(ms: number): Promise<unknown> {
      return new Promise<unknown>((resolve) => setTimeout(resolve, ms));
    }

    await sleep(1000);

    const commandStatusResponse = await awsEnvMgt.awsService.clients.ssm.getCommandInvocationCommand(
      ssmStatusCommand
    );

    console.log(JSON.stringify(commandStatusResponse));

    const ssmCommandStatus: SSMCommandStatus = {
      CommandId: commandStatusResponse.CommandId!,
      InstanceId: commandStatusResponse.InstanceId!,
      ResponseCode: commandStatusResponse.ResponseCode!,
      StandardOutputContent:
        slurmCommand === 'squeue'
          ? JSON.parse(commandStatusResponse.StandardOutputContent!)
          : commandStatusResponse.StandardOutputContent,
      Status: commandStatusResponse.Status!,
      StatusDetails: commandStatusResponse.StatusDetails!
    };

    return new Promise((resolve, reject) => {
      resolve(ssmCommandStatus);
      reject('Error has occured');
    });
  }

  public async jobQueue(req: Request): Promise<SSMCommandStatus> {
    return this.performSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'squeue',
      'squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,start_time,end_time\\}\\)'
    );
  }

  public async submitJob(req: Request): Promise<SSMCommandStatus> {
    const jobParams = req.body as JobParameters;

    console.log(JSON.stringify(jobParams));

    return this.performSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'sbatch',
      `sbatch --job-name ${jobParams.job_name} --nodes ${jobParams.nodes} --ntasks ${jobParams.ntasks}  --partition ${jobParams.partition} ${jobParams.command}`
    );
  }

  public async cancelJob(req: Request): Promise<SSMCommandStatus> {
    return this.performSSMCommand(
      req.params.projectId,
      req.params.instanceId,
      'scancel',
      `scancel ${req.params.jobId}`
    );
  }
}
