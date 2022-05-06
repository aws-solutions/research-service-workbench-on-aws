/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import CloudFormation from './clients/cloudformation';
import Cognito from './clients/cognito';
import EC2 from './clients/ec2';
import EventBridge from './clients/eventbridge';
import SSM from './clients/ssm';
import ServiceCatalog from './clients/serviceCatalog';
import S3 from './clients/s3';
import STS from './clients/sts';
import { Credentials } from '@aws-sdk/types';
import IAM from './clients/iam';
import CloudformationService from './helpers/cloudformationService';
import S3Service from './helpers/s3Service';
import DynamoDB from './clients/dynamoDB';
import DynamoDBService from './helpers/dynamoDB/dynamoDBService';
import Lambda from './clients/lambda';
import SageMaker from './clients/sagemaker';

export default class AwsService {
  public clients: {
    cloudformation: CloudFormation;
    cognito: Cognito;
    ssm: SSM;
    ec2: EC2;
    eventBridge: EventBridge;
    serviceCatalog: ServiceCatalog;
    s3: S3;
    sts: STS;
    iam: IAM;
    ddb: DynamoDB;
    lambda: Lambda;
    sagemaker: SageMaker;
  };
  public helpers: {
    cloudformation: CloudformationService;
    s3: S3Service;
    ddb: DynamoDBService;
  };

  public constructor(options: { region: string; ddbTableName?: string; credentials?: Credentials }) {
    const { region, ddbTableName } = options;
    this.clients = {
      cloudformation: new CloudFormation(options),
      cognito: new Cognito(options),
      ssm: new SSM(options),
      ec2: new EC2(options),
      eventBridge: new EventBridge(options),
      serviceCatalog: new ServiceCatalog(options),
      s3: new S3(options),
      sts: new STS(options),
      iam: new IAM(options),
      ddb: new DynamoDB({ region }),
      lambda: new Lambda({ region }),
      sagemaker: new SageMaker({ region })
    };

    this.helpers = {
      cloudformation: new CloudformationService(this.clients.cloudformation),
      s3: new S3Service(this.clients.s3),
      ddb: new DynamoDBService({ region, table: ddbTableName || '' })
    };
  }

  public async getAwsServiceForRole(params: {
    roleArn: string;
    roleSessionName: string;
    externalId?: string;
    region: string;
  }): Promise<AwsService> {
    const { Credentials } = await this.clients.sts.assumeRole({
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
