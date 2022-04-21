/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import CloudFormation from './services/cloudformation';
import Cognito from './services/cognito';
import EC2 from './services/ec2';
import EventBridge from './services/eventbridge';
import SSM from './services/ssm';
import ServiceCatalog from './services/serviceCatalog';
import S3 from './services/s3';
import STS from './services/sts';
import { Credentials } from '@aws-sdk/types';
import IAM from './services/iam';

export default class AwsService {
  public cloudformation: CloudFormation;
  public cognito: Cognito;
  public ssm: SSM;
  public ec2: EC2;
  public eventBridge: EventBridge;
  public serviceCatalog: ServiceCatalog;
  public s3: S3;
  public sts: STS;
  public iam: IAM;

  public constructor(options: { region: string; credentials?: Credentials }) {
    this.cloudformation = new CloudFormation(options);
    this.cognito = new Cognito(options);
    this.ssm = new SSM(options);
    this.ec2 = new EC2(options);
    this.eventBridge = new EventBridge(options);
    this.serviceCatalog = new ServiceCatalog(options);
    this.s3 = new S3(options);
    this.sts = new STS(options);
    this.iam = new IAM(options);
  }

  public async getAwsServiceForRole(params: {
    roleArn: string;
    roleSessionName: string;
    externalId?: string;
    region: string;
  }): Promise<AwsService> {
    const { Credentials } = await this.sts.assumeRole({
      RoleArn: params.roleArn,
      RoleSessionName: params.roleSessionName,
      ExternalId: params.externalId
    });
    if (Credentials) {
      return new AwsService({
        region: params.region,
        credentials: {
          accessKeyId: Credentials.AccessKeyId!,
          secretAccessKey: Credentials.SecretAccessKey!,
          sessionToken: Credentials.SessionToken!
        }
      });
    } else {
      throw new Error(`Unable to assume role with params: ${params}`);
    }
  }
}
