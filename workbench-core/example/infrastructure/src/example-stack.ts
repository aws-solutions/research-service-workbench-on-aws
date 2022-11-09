/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { WorkbenchCognito, WorkbenchCognitoProps } from '@aws/workbench-core-infrastructure';
import { Aws, aws_cognito, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  CfnDeployment,
  CfnMethod,
  CfnStage,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, CfnTable, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  AnyPrincipal,
  CfnPolicy,
  Effect,
  Policy,
  PolicyStatement,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Alias, CfnFunction, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnLogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket, BucketEncryption, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { v4 as uuid } from 'uuid';
import { EncryptionKeyWithRotation } from './constructs/encryptionKeyWithRotation';
import { SecureS3Bucket } from './constructs/secureS3Bucket';

export class ExampleStack extends Stack {
  private _exampleLambdaEnvVars: {
    COGNITO_DOMAIN: string;
    USER_POOL_ID: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    STACK_NAME: string;
  };

  private _accessLogsBucket: Bucket;
  private _s3AccessLogsPrefix: string;

  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const random = uuid({});
    const exampleCognito = this._createExampleCognitoResources(
      `example-app-domain-${random}`,
      ['http://localhost:3000/'],
      `example-app-userPool`,
      `example-app-userPoolClient`
    );

    this._exampleLambdaEnvVars = {
      COGNITO_DOMAIN: exampleCognito.cognitoDomain,
      USER_POOL_ID: exampleCognito.userPoolId,
      CLIENT_ID: exampleCognito.userPoolClientId,
      CLIENT_SECRET: exampleCognito.userPoolClientSecret.unsafeUnwrap(),
      STACK_NAME: Aws.STACK_NAME
    };

    this._s3AccessLogsPrefix = 'example-access-log';
    const createEncryptionKey: EncryptionKeyWithRotation = new EncryptionKeyWithRotation(
      this,
      'DataSetBucket-EncryptionKey'
    );
    const encryptionKey: Key = createEncryptionKey.key;
    this._accessLogsBucket = this._createAccessLogsBucket('ExampleS3BucketAccessLogsNameOutput');
    const createDatasetBucket = new SecureS3Bucket(this, 'Example-S3Bucket', {
      s3BucketId: 'example-s3-datasets',
      s3OutputId: 'ExampleS3BucketDatasetsArnOutput',
      encryptionKey: encryptionKey,
      serverAccessLogsBucket: this._accessLogsBucket,
      serverAccessLogsPrefix: this._s3AccessLogsPrefix
    });
    const datasetBucket: Bucket = createDatasetBucket.bucket;

    this._addAccessPointDelegationStatement(datasetBucket);

    const exampleLambda: Function = this._createLambda(datasetBucket);

    const table = this._createDDBTable(exampleLambda);

    exampleLambda.addEnvironment('DDB_TABLE_NAME', table.tableName);

    this._createRestApi(exampleLambda);

    //CFN NAG Suppression
    const customResourceLambdaNode = this.node.findChild('AWS679f53fac002430cb0da5b7982bd2287');
    const customResourceLambdaMetaDataNode = customResourceLambdaNode.node.defaultChild as CfnFunction;
    customResourceLambdaMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason:
            'AWSCustomResource Lambda Function has AWSLambdaBasicExecutionRole policy attached which has the required permission to write to Cloudwatch Logs'
        },
        {
          id: 'W89',
          reason:
            'AWSCustomResource Lambda Function supports infrastructure deployment and is not deployed inside a VPC'
        },
        {
          id: 'W92',
          reason:
            'AWSCustomResource Lambda Function used for provisioning infrastructure, reserved concurrency is not required'
        }
      ]
    });

    new CfnOutput(this, 'AwsRegion', {
      value: Aws.REGION
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource',
      [
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'I am OK with this, this is part of the Custom resource defined in the @aws/workbench-core-infrastructure package',
          appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
        }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/AWS679f53fac002430cb0da5b7982bd2287/Resource',
      [{ id: 'AwsSolutions-L1', reason: 'This is an AWSCustom Resource Lambda Function, I am ok with this' }]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/ExampleLambdaService/ServiceRole/DefaultPolicy/Resource',
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'I am OK with using wildcard here'
        }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(this, '/ExampleStack/ExampleStack/Resource', [
      {
        id: 'AwsSolutions-DDB3',
        reason: 'I am OK with not having Point-in-time Recovery enabled for DynamoDB, this is an example app'
      }
    ]);

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/ExampleRestApi/CloudWatchRole/Resource',
      [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'I am OK with using managed Policy here',
          appliesTo: [
            'Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'
          ]
        }
      ]
    );

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-APIG3', reason: 'I am ok with not using WAFv2, this is an example App' },
      {
        id: 'AwsSolutions-APIG6',
        reason: 'I am ok with not enabling Cloudwatch logging at stage level, this is an example App'
      },
      { id: 'AwsSolutions-APIG4', reason: '@aws/workbench-core-authorization implemented at app level' },
      { id: 'AwsSolutions-COG4', reason: '@aws/workbench-core-authorization implemented at app level' }
    ]);
  }

  // DynamoDB Table
  private _createDDBTable(exampleLambda: Function): Table {
    const table = new Table(this, `${this.stackName}`, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      // tableName: tableName,  W28: Resource found with an explicit name, this disallows updates that require replacement of this resource
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    //CFN NAG Suppression
    const tableNode = table.node.defaultChild as CfnTable;
    tableNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W78',
          reason: 'This is an example app for integration test, backup is not required'
        },
        {
          id: 'W74',
          reason: 'default: server-side encryption is enabled with an AWS owned customer master key'
        }
      ]
    });

    // Add GSI for get resource by name
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByName',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'name', type: AttributeType.STRING }
    });
    // Add GSI for get resource by status
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByStatus',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'status', type: AttributeType.STRING }
    });
    // Add GSI for get resource by createdAt
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByCreatedAt',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING }
    });
    // Add GSI for get resource by dependency
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByDependency',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'dependency', type: AttributeType.STRING }
    });
    // Add GSI for get resource by owner
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByOwner',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'owner', type: AttributeType.STRING }
    });
    // TODO Add GSI for get resource by cost
    // Add GSI for get resource by type
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByType',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'type', type: AttributeType.STRING }
    });
    // Grant the Lambda Functions read access to the DynamoDB table
    table.grantReadWriteData(exampleLambda);

    new CfnOutput(this, 'ExampleDynamoDBTableOutput', { value: table.tableArn });
    new CfnOutput(this, 'ExampleDynamoDBTableName', { value: table.tableName });
    return table;
  }

  private _addAccessPointDelegationStatement(s3Bucket: Bucket): void {
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.bucketArn, s3Bucket.arnForObjects('*')],
        conditions: {
          StringEquals: {
            's3:DataAccessPointAccount': Aws.ACCOUNT_ID
          }
        }
      })
    );
  }

  private _createAccessLogsBucket(bucketNameOutput: string): Bucket {
    const exampleS3AccessLogsBucket = new Bucket(this, 'ExampleS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true
    });

    exampleS3AccessLogsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${exampleS3AccessLogsBucket.bucketArn}/${this._s3AccessLogsPrefix}*`],
        conditions: {
          StringEquals: {
            'aws:SourceAccount': Aws.ACCOUNT_ID
          }
        }
      })
    );

    //CFN NAG Suppression
    const exampleS3AccessLogsBucketNode = exampleS3AccessLogsBucket.node.defaultChild as CfnBucket;
    exampleS3AccessLogsBucketNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W35',
          reason:
            "This is an access log bucket, we don't need to configure access logging for access log buckets"
        }
      ]
    });

    new CfnOutput(this, bucketNameOutput, {
      value: exampleS3AccessLogsBucket.bucketName,
      exportName: bucketNameOutput
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressions(exampleS3AccessLogsBucket, [
      {
        id: 'AwsSolutions-S1',
        reason:
          "This is an access log bucket, we don't need to configure access logging for access log buckets"
      }
    ]);

    return exampleS3AccessLogsBucket;
  }

  private _createRestApi(exampleLambda: Function): void {
    const logGroup = new LogGroup(this, 'ExampleAPIGatewayAccessLogs');

    const logGroupNode = logGroup.node.defaultChild as CfnLogGroup;
    logGroupNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W84',
          reason: 'Cloudwatch LogGroups are encrypted by default'
        }
      ]
    });

    const API: RestApi = new RestApi(this, `ExampleRestApi`, {
      restApiName: 'ExampleRestAPI',
      description: 'Example Rest API',
      deployOptions: {
        stageName: 'dev',
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.custom(
          JSON.stringify({
            stage: '$context.stage',
            requestId: '$context.requestId',
            integrationRequestId: '$context.integration.requestId',
            status: '$context.status',
            apiId: '$context.apiId',
            resourcePath: '$context.resourcePath',
            path: '$context.path',
            resourceId: '$context.resourceId',
            httpMethod: '$context.httpMethod',
            sourceIp: '$context.identity.sourceIp',
            userAgent: '$context.identity.userAgent'
          })
        ),
        throttlingBurstLimit: 50,
        throttlingRateLimit: 100
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'CSRF-Token'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000/']
      }
    });

    //CFN NAG Suppression
    const deploymentNode = API.node.findChild('Deployment');
    const deploymentMetaDataNode = deploymentNode.node.defaultChild as CfnDeployment;
    deploymentMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W68',
          reason: 'No need to enforce Usage Plan. This is an example App'
        }
      ]
    });

    //CFN NAG Suppression
    const deploymentStageNode = API.node.findChild('DeploymentStage.dev');
    const deploymentStageMetaDataNode = deploymentStageNode.node.defaultChild as CfnStage;
    deploymentStageMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W64',
          reason: 'No need to enforce Usage Plan. This is an example App'
        }
      ]
    });

    new CfnOutput(this, 'ExampleAPIEndpoint', {
      value: API.url
    });

    const alias = new Alias(this, 'Alias', {
      aliasName: 'live',
      version: exampleLambda.currentVersion,
      provisionedConcurrentExecutions: 1
    });

    API.root.addProxy({
      defaultIntegration: new LambdaIntegration(alias)
    });

    //CFN NAG Suppression
    const anyMethodNode = API.node.findChild('Default').node.findChild('ANY');
    const anyMethodMetaDataNode = anyMethodNode.node.defaultChild as CfnMethod;
    anyMethodMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W59',
          reason: 'Making use of custom Authorization at the App level, this is ok !'
        }
      ]
    });

    //CFN NAG Suppression
    const anyProxyNode = API.node.findChild('Default').node.findChild('{proxy+}').node.findChild('ANY');
    const anyProxyMetaDataNode = anyProxyNode.node.defaultChild as CfnMethod;
    anyProxyMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W59',
          reason: 'Making use of custom Authorization at the App level, this is ok !'
        }
      ]
    });

    NagSuppressions.addResourceSuppressions(
      API,
      [
        {
          id: 'AwsSolutions-APIG2',
          reason: 'I am OK with not enabling request validation for Rest API, this is an example App'
        }
      ],
      true
    );
  }

  private _createLambda(datasetBucket: Bucket): Function {
    const exampleLambda: Function = new Function(this, 'ExampleLambdaService', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'buildLambda.handler',
      code: Code.fromAsset('build'),
      functionName: 'ExampleLambda',
      environment: this._exampleLambdaEnvVars,
      timeout: Duration.seconds(29), // Integration timeout should be 29 seconds https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
      memorySize: 832
    });

    const exampleLambdaPolicy: Policy = new Policy(this, 'ExampleLambdaPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['events:DescribeRule', 'events:Put*'],
          resources: [`arn:aws:events:${Aws.REGION}:${this.account}:event-bus/default`],
          sid: 'EventBridgeAccess'
        }),
        new PolicyStatement({
          actions: ['cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents'],
          resources: [`arn:aws:cloudformation:${Aws.REGION}:*:stack/${this.stackName}*`],
          sid: 'CfnAccess'
        }),
        new PolicyStatement({
          actions: ['cognito-idp:DescribeUserPoolClient'],
          resources: [`arn:aws:cognito-idp:${Aws.REGION}:${this.account}:userpool/*`],
          sid: 'CognitoAccess'
        }),
        new PolicyStatement({
          actions: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy', 'kms:GenerateDataKey'], //GenerateDataKey is required when creating a DS through the API
          resources: [`arn:aws:kms:${Aws.REGION}:${this.account}:key/*`],
          sid: 'KMSAccess'
        }),
        new PolicyStatement({
          actions: ['events:DescribeRule', 'events:Put*', 'events:RemovePermission'],
          resources: ['*'],
          sid: 'EventbridgeAccess'
        }),
        new PolicyStatement({
          actions: ['logs:CreateLogGroup'],
          resources: [`arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`]
        }),
        new PolicyStatement({
          actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
          resources: [
            `arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${exampleLambda.functionName}:*`
          ]
        }),
        new PolicyStatement({
          sid: 'datasetS3Access',
          actions: [
            's3:GetObject',
            's3:GetObjectVersion',
            's3:GetObjectTagging',
            's3:AbortMultipartUpload',
            's3:ListMultipartUploadParts',
            's3:GetBucketPolicy',
            's3:PutBucketPolicy',
            's3:PutObject',
            's3:PutObjectAcl',
            's3:PutObjectTagging',
            's3:ListBucket',
            's3:PutAccessPointPolicy',
            's3:GetAccessPointPolicy',
            's3:CreateAccessPoint',
            's3:DeleteAccessPoint'
          ],
          resources: [
            datasetBucket.bucketArn,
            `${datasetBucket.bucketArn}/*`,
            `arn:aws:s3:${this.region}:${this.account}:accesspoint/*`
          ]
        }),
        new PolicyStatement({
          sid: 'cognitoAccess',
          actions: [
            'cognito-idp:AdminAddUserToGroup',
            'cognito-idp:AdminCreateUser',
            'cognito-idp:AdminDeleteUser',
            'cognito-idp:AdminGetUser',
            'cognito-idp:AdminListGroupsForUser',
            'cognito-idp:AdminRemoveUserFromGroup',
            'cognito-idp:AdminUpdateUserAttributes',
            'cognito-idp:CreateGroup',
            'cognito-idp:DeleteGroup',
            'cognito-idp:ListGroups',
            'cognito-idp:ListUsers',
            'cognito-idp:ListUsersInGroup'
          ],
          resources: ['*']
        })
      ]
    });

    //CFN NAG Suppression
    const exampleLambdaNode = exampleLambda.node.defaultChild as CfnFunction;
    exampleLambdaNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason: 'Lambda Function has permission to write to Cloudwatch Logs in exampleLambdaPolicy'
        },
        {
          id: 'W89',
          reason: 'This is an example Lambda Function for integration test and is not deployed inside a VPC'
        },
        {
          id: 'W92',
          reason: 'This is an example Lambda Function, reserved concurrency is not required'
        }
      ]
    });

    //CFN NAG Suppression
    const exampleLambdaPolicyNode = exampleLambdaPolicy.node.defaultChild as CfnPolicy;
    exampleLambdaPolicyNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W12',
          reason: 'I am ok with using wildcard here !'
        }
      ]
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressions(
      exampleLambdaPolicy,
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'I am OK with using wildcard here'
        }
      ],
      true
    );

    exampleLambda.role!.attachInlinePolicy(exampleLambdaPolicy);

    new CfnOutput(this, 'ExampleLambdaRoleOutput', {
      value: exampleLambda.role!.roleArn
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressions(
      exampleLambda,
      [
        {
          id: 'AwsSolutions-IAM4',
          reason: 'I am OK with using AWSLambdaBasicExecutionRole here',
          appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
        }
      ],
      true
    );

    return exampleLambda;
  }

  private _createExampleCognitoResources(
    domainPrefix: string,
    websiteUrls: string[],
    userPoolName: string,
    userPoolClientName: string
  ): WorkbenchCognito {
    const props: WorkbenchCognitoProps = {
      domainPrefix: domainPrefix,
      websiteUrls: websiteUrls,
      userPoolName: userPoolName,
      userPoolClientName: userPoolClientName,
      oidcIdentityProviders: [],
      accessTokenValidity: Duration.minutes(60) // Extend access token expiration to 60 minutes to allow integration tests to run successfully. Once MAFoundation-310 has been implemented to allow multiple clientIds, we'll create a separate client for integration tests and the "main" client access token expiration time can be return to 15 minutes
    };

    const workbenchCognito = new WorkbenchCognito(this, 'ExampleServiceWorkbenchCognito', props);
    const cfnUserPool: aws_cognito.CfnUserPool = workbenchCognito.userPool!.node
      .defaultChild as aws_cognito.CfnUserPool;
    cfnUserPool.userPoolAddOns = {
      advancedSecurityMode: 'ENFORCED'
    };

    new CfnOutput(this, 'ExampleCognitoUserPoolId', {
      value: workbenchCognito.userPoolId,
      exportName: 'ExampleUserPoolId'
    });

    new CfnOutput(this, 'ExampleCognitoUserPoolClientId', {
      value: workbenchCognito.userPoolClientId,
      exportName: 'ExampleCognitoUserPoolClientId'
    });

    new CfnOutput(this, 'ExampleCognitoDomainName', {
      value: workbenchCognito.cognitoDomain,
      exportName: 'ExampleCognitoDomain'
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/ExampleServiceWorkbenchCognito/WorkbenchUserPool/Resource',
      [
        { id: 'AwsSolutions-COG1', reason: 'Should be fixed in @aws/workbench-core-infrastructure package' },
        {
          id: 'AwsSolutions-COG2',
          reason: 'This is an example package for integration test, selecting default MFA Optional'
        }
      ]
    );

    return workbenchCognito;
  }
}
