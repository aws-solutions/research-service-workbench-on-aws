/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { EC2 } from '@aws-sdk/client-ec2';
import { EC2InstanceConnect } from '@aws-sdk/client-ec2-instance-connect';
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { IAM } from '@aws-sdk/client-iam';
import { KMS } from '@aws-sdk/client-kms';
import { Lambda } from '@aws-sdk/client-lambda';
import { S3 } from '@aws-sdk/client-s3';
import { S3Control } from '@aws-sdk/client-s3-control';
import { SageMaker } from '@aws-sdk/client-sagemaker';
import { ServiceCatalog } from '@aws-sdk/client-service-catalog';
import { ServiceCatalogAppRegistry } from '@aws-sdk/client-service-catalog-appregistry';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';
import { SSM } from '@aws-sdk/client-ssm';
import { STS } from '@aws-sdk/client-sts';
import { Credentials } from '@aws-sdk/types';
import AppRegistryService from './helpers/appRegistryService';
import CloudformationService from './helpers/cloudformationService';
import DynamoDBService from './helpers/dynamoDB/dynamoDBService';
import S3Service from './helpers/s3Service';
import ServiceCatalogService from './helpers/serviceCatalogService';

export default class AwsService {
  public clients: {
    cloudformation: CloudFormation;
    cognito: CognitoIdentityProvider;
    ssm: SSM;
    ec2: EC2;
    ec2InstanceConnect: EC2InstanceConnect;
    eventBridge: EventBridge;
    serviceCatalog: ServiceCatalog;
    s3: S3;
    sts: STS;
    iam: IAM;
    ddb: DynamoDB;
    s3Control: S3Control;
    lambda: Lambda;
    sagemaker: SageMaker;
    kms: KMS;
    appRegistry: ServiceCatalogAppRegistry;
    serviceQuotas: ServiceQuotas;
  };
  public helpers: {
    cloudformation: CloudformationService;
    s3: S3Service;
    ddb: DynamoDBService;
    serviceCatalog: ServiceCatalogService;
    appRegistryService: AppRegistryService;
  };

  public constructor(options: { region: string; ddbTableName?: string; credentials?: Credentials }) {
    const { region, ddbTableName } = options;
    this.clients = {
      cloudformation: new CloudFormation(options),
      cognito: new CognitoIdentityProvider(options),
      ssm: new SSM(options),
      ec2: new EC2(options),
      ec2InstanceConnect: new EC2InstanceConnect(options),
      eventBridge: new EventBridge(options),
      serviceCatalog: new ServiceCatalog(options),
      s3: new S3(options),
      sts: new STS(options),
      iam: new IAM(options),
      s3Control: new S3Control(options),
      ddb: new DynamoDB(options),
      lambda: new Lambda(options),
      sagemaker: new SageMaker(options),
      kms: new KMS(options),
      appRegistry: new ServiceCatalogAppRegistry(options),
      serviceQuotas: new ServiceQuotas(options)
    };

    this.helpers = {
      cloudformation: new CloudformationService(this.clients.cloudformation),
      s3: new S3Service(this.clients.s3),
      ddb: new DynamoDBService({ region, table: ddbTableName || '' }),
      serviceCatalog: new ServiceCatalogService(this.clients.serviceCatalog),
      appRegistryService: new AppRegistryService(
        this.clients.appRegistry,
        this.clients.cloudformation,
        this.clients.serviceQuotas
      )
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
