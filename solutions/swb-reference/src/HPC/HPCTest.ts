/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Request } from 'express';
import aws4 from 'aws4';
import axios, { Method } from 'axios';
//import { aws4Interceptor } from "aws4-axios";
import { AwsService } from '@amzn/workbench-core-base';
import { ProjectService } from '@amzn/environments';
//import { AssumeRoleCommand, AssumeRoleCommandInput, STSClient } from '@aws-sdk/client-sts';
import { IncomingMessage } from 'http';
import https from 'https';
//import * as AWSCognito from "@aws-sdk/client-cognito-identity-provider";

interface JobParameters {
  instanceId: string;
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

interface SignedRequest {
  method: Method;
  service: string;
  region: string;
  host: string;
  headers: Record<string, string>;
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

  public async jobQueue(req: Request): Promise<string> {
    const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const ssm_command = {
      InstanceIds: [req.params.instanceId],
      DocumentName: 'AWS-RunShellScript',
      Comment: 'Run ssm command.',
      Parameters: {
        commands: [
          `runuser -l ec2-user -c 'squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,start_time,end_time\\}\\)'`
        ]
      }
    };

    console.log(JSON.stringify(ssm_command));

    const sendCommandResponse = await awsEnvMgt.awsService.clients.ssm.sendCommand(ssm_command);

    console.log(JSON.stringify(sendCommandResponse));

    const ssmStatusCommand = {
      CommandId: sendCommandResponse.Command?.CommandId,
      InstanceId: req.params.instanceId
    };

    function sleep(ms: number): Promise<unknown> {
      return new Promise<unknown>((resolve) => setTimeout(resolve, ms));
    }

    await sleep(750);

    const command_status = await awsEnvMgt.awsService.clients.ssm.getCommandInvocationCommand(
      ssmStatusCommand
    );

    console.log(JSON.stringify(command_status));

    return new Promise((resolve, reject) => {
      resolve(JSON.stringify(command_status.StandardOutputContent));
      reject('Error has occured');
    });
  }

  public async submitJob(req: Request): Promise<string> {
    const body = req.body;

    const jobParams = body as unknown as JobParameters;

    console.log(JSON.stringify(jobParams));

    const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const ssm_command = {
      InstanceIds: [jobParams.instanceId],
      DocumentName: 'AWS-RunShellScript',
      Comment: 'Run ssm command.',
      Parameters: {
        commands: [
          `runuser -l ec2-user -c 'sbatch --job-name ${jobParams.job_name} --nodes ${jobParams.nodes} --ntasks ${jobParams.ntasks}  --partition ${jobParams.partition} ${jobParams.command}'`
        ]
      }
    };

    console.log(JSON.stringify(ssm_command));

    const sendCommandResponse = await awsEnvMgt.awsService.clients.ssm.sendCommand(ssm_command);

    console.log(JSON.stringify(sendCommandResponse));

    const ssmStatusCommand = {
      CommandId: sendCommandResponse.Command?.CommandId,
      InstanceId: jobParams.instanceId
    };

    function sleep(ms: number): Promise<unknown> {
      return new Promise<unknown>((resolve) => setTimeout(resolve, ms));
    }

    await sleep(750);

    const command_status = await awsEnvMgt.awsService.clients.ssm.getCommandInvocationCommand(
      ssmStatusCommand
    );

    console.log(JSON.stringify(command_status));

    return new Promise((resolve, reject) => {
      resolve(JSON.stringify(command_status.StandardOutputContent));
      reject('Error has occured');
    });
  }

  public async cancelJob(req: Request): Promise<string> {
    const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const ssm_command = {
      InstanceIds: [req.params.instanceId],
      DocumentName: 'AWS-RunShellScript',
      Comment: 'Run ssm command.',
      Parameters: { commands: [`runuser -l ec2-user -c 'scancel ${req.params.jobId}'`] }
    };

    console.log(JSON.stringify(ssm_command));

    const sendCommandResponse = await awsEnvMgt.awsService.clients.ssm.sendCommand(ssm_command);

    console.log(JSON.stringify(sendCommandResponse));

    const ssmStatusCommand = {
      CommandId: sendCommandResponse.Command?.CommandId,
      InstanceId: req.params.instanceId
    };

    function sleep(ms: number): Promise<unknown> {
      return new Promise<unknown>((resolve) => setTimeout(resolve, ms));
    }

    await sleep(750);

    const command_status = await awsEnvMgt.awsService.clients.ssm.getCommandInvocationCommand(
      ssmStatusCommand
    );

    console.log(JSON.stringify(command_status));

    return new Promise((resolve, reject) => {
      resolve(JSON.stringify(command_status.StandardOutputContent));
      reject('Error has occured');
    });
  }

  public async axiosSigV4Request(req: Request): Promise<string> {
    const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    /*const interceptor = aws4Interceptor(
      {
      region: process.env.AWS_REGION!,
      service: "execute-api",
      },
      {
        accessKeyId: awsEnvMgt.credentials.AccessKeyId,
        secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
        sessionToken: awsEnvMgt.credentials.SessionToken,
      }
    );

    axios.interceptors.request.use(interceptor);*/

    const opts = {
      method: 'GET',
      service: 'execute-api',
      region: 'us-east-1',
      host: new URL(process.env.PCLUSTER_API_URL! + '/prod/v3/clusters' ?? '')
    };

    const secs = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed = aws4.sign(opts, secs) as SignedRequest;

    console.log(JSON.stringify(signed));

    const apiURLWithPath = process.env.PCLUSTER_API_URL! + '/prod/v3/clusters' ?? '';

    // Requests made using Axios will now be signed
    const response = await axios({ ...signed, url: apiURLWithPath });

    console.log(JSON.stringify(response));

    return new Promise((resolve, reject) => {
      resolve(JSON.stringify(response.data));
      reject('Error has occured');
    });
  }

  public async awsSigV4Request(req: Request): Promise<string> {
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

    console.log(JSON.stringify(signed));

    return new Promise((resolve, reject) => {
      const https_req = https.request(signed, function (res: IncomingMessage) {
        let response_body = '';
        res.on('data', (chunk: string) => {
          response_body += chunk;
        });
        res.on('end', () => {
          if (req.params.clusterName) {
            const cluster = JSON.parse(response_body) as Cluster;
            resolve(JSON.stringify(cluster));
          } else {
            const body = JSON.parse(response_body);
            const clusterList: Cluster[] = body.clusters as Cluster[];
            resolve(JSON.stringify(clusterList));
          }
        });
      });
      https_req.on('error', (err: string) => {
        reject(err);
      });
      https_req.end();
    });
  }

  public async getPClusterList(req: Request): Promise<string> {
    return this.axiosSigV4Request(req);
  }
  /*const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const opts = {
      host: `${req.params.apiName}.execute-api.${req.params.region}.amazonaws.com`,
      service: 'execute-api',
      region: 'us-east-1',
      method: 'GET',
      path: '/prod/v3/clusters'
    };

    const secs = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed: aws4.Request = aws4.sign(opts, secs);

    return new Promise((resolve, reject) => {
      const req = https.request(signed, function (res : IncomingMessage) {
        let response_body = '';
        res.on('data', (chunk : string) => {
          response_body += chunk;
        });
        res.on('end', () => {
          const body = JSON.parse(response_body);
          const clusterList : Cluster[] = body.clusters as Cluster[];
          resolve(JSON.stringify(clusterList));
        });
      });
      req.on('error', (err: string) => {
        reject(err);
      });
      req.end();
    });*/

  public async getCluster(req: Request): Promise<string> {
    return this.axiosSigV4Request(req);
  }
  /*const awsEnvMgt = await this.awsAssumeEnvMgt(req.params.projectId);

    const opts = {
      host: `${req.params.apiName}.execute-api.${req.params.region}.amazonaws.com`,
      service: 'execute-api',
      region: 'us-east-1',
      method: 'GET',
      path: `/prod/v3/clusters/${req.params.clusterName}`
    };

    const secs = {
      accessKeyId: awsEnvMgt.credentials.AccessKeyId,
      secretAccessKey: awsEnvMgt.credentials.SecretAccessKey,
      sessionToken: awsEnvMgt.credentials.SessionToken
    };

    const signed: aws4.Request = aws4.sign(opts, secs);

    return new Promise((resolve, reject) => {
      const req = https.request(signed, function (res : IncomingMessage) {
        let response_body = '';
        res.on('data', (chunk : string) => {
          response_body += chunk;
        });
        res.on('end', () => {
          const cluster = JSON.parse(response_body) as Cluster;
          resolve(JSON.stringify(cluster));
        });
      });
      req.on('error', (err: string) => {
        reject(err);
      });
      req.end();
    });*/
}
