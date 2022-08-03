/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { IncomingMessage } from 'http';
import https from 'https';
import { AwsService } from '@aws/workbench-core-base';
import { ProjectService } from '@aws/workbench-core-environments';
import aws4 from 'aws4';
import { Request } from 'express';
import { AwsServiceWithCredentials, SSMCommandStatus, Cluster } from './HPCTypes';

export default class HPCServiceHelper {
  public aws: AwsService;
  public projService: ProjectService;

  public constructor() {
    this.aws = new AwsService({ region: process.env.AWS_REGION! });
    this.projService = new ProjectService({ TABLE_NAME: process.env.STACK_NAME! });
  }

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
    const timestamp = new Date().getTime();

    const projItem = await this.projService.getProject(projectId);

    const assumeRoleParams = {
      aws: this.aws,
      roleArn: projItem.envMgmtRoleArn,
      roleSessionName: `hpc-service-${timestamp}`,
      region: process.env.AWS_REGION!,
      externalId: projItem.externalId
    };

    const envMgtAWS = await this.assumeRoleWithCredentials(assumeRoleParams);

    return envMgtAWS;
  }

  public async sendSignedClusterRequest(req: Request, signed: aws4.Request): Promise<Cluster | Cluster[]> {
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

  public async executeSSMCommand(
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

    const sendCommandResponse = await awsEnvMgt.awsService.clients.ssm.sendCommand(ssm_command);

    const ssmStatusCommand = {
      CommandId: sendCommandResponse.Command?.CommandId,
      InstanceId: instanceId
    };

    async function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    await sleep(2000); // SSM Commands to head node take time to process, best to wait a couple seconds.

    const commandStatusResponse = await awsEnvMgt.awsService.clients.ssm.getCommandInvocation(
      ssmStatusCommand
    );

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

    return ssmCommandStatus;
  }
}
