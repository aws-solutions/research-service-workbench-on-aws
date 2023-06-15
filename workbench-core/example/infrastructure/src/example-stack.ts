/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import {
  WorkbenchCognito,
  WorkbenchCognitoProps,
  WorkbenchEncryptionKeyWithRotation,
  WorkbenchSecureS3Bucket,
  WorkbenchDynamodb
} from '@aws/workbench-core-infrastructure';
import { Aws, aws_cognito, CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  CfnDeployment,
  CfnMethod,
  CfnStage,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  CfnPolicy,
  ManagedPolicy,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Alias, CfnFunction, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnLogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { addAccessPointDelegationStatement, createAccessLogsBucket } from './helpers/helper-function';

export interface ExampleStackProps extends StackProps {
  hostingAccountId: string;
  crossAccountRoleName: string;
}

export class ExampleStack extends Stack {
  private _exampleLambdaEnvVars: {
    COGNITO_DOMAIN: string;
    USER_POOL_ID: string;
    WEB_UI_CLIENT_ID: string;
    WEB_UI_CLIENT_SECRET: string;
    PROGRAMMATIC_ACCESS_CLIENT_ID: string;
    STACK_NAME: string;
  };

  private _accessLogsBucket: Bucket;
  private _s3AccessLogsPrefix: string;

  public constructor(scope: Construct, id: string, props: ExampleStackProps) {
    super(scope, id, props);

    const domainSuffix = `${Aws.ACCOUNT_ID}-${Aws.REGION}`;
    const exampleCognito = this._createExampleCognitoResources(
      `example-app-domain-${domainSuffix}`,
      ['http://localhost:3000/'],
      `example-app-userPool`,
      `example-app-userPoolClient`
    );

    this._exampleLambdaEnvVars = {
      COGNITO_DOMAIN: exampleCognito.cognitoDomain,
      USER_POOL_ID: exampleCognito.userPoolId,
      WEB_UI_CLIENT_ID: exampleCognito.webUiUserPoolClientId,
      WEB_UI_CLIENT_SECRET: exampleCognito.webUiUserPoolClientSecret.unsafeUnwrap(),
      PROGRAMMATIC_ACCESS_CLIENT_ID: exampleCognito.programmaticAccessUserPoolClientId,
      STACK_NAME: Aws.STACK_NAME
    };

    this._s3AccessLogsPrefix = 'example-access-log';
    const workbenchEncryptionKey: WorkbenchEncryptionKeyWithRotation = new WorkbenchEncryptionKeyWithRotation(
      this,
      'DataSetBucketEncryptionKey',
      {
        removalPolicy: RemovalPolicy.DESTROY
      }
    );
    const encryptionKey: Key = workbenchEncryptionKey.key;

    // this._accessLogsBucket = this._createAccessLogsBucket('ExampleS3BucketAccessLogsNameOutput');
    this._accessLogsBucket = createAccessLogsBucket(
      this,
      'ExampleS3AccessLogsBucket',
      this._s3AccessLogsPrefix,
      'ExampleS3BucketAccessLogsNameOutput'
    );

    const workbenchSecureS3Bucket = new WorkbenchSecureS3Bucket(this, 'ExampleS3Bucket', {
      encryptionKey: encryptionKey,
      serverAccessLogsBucket: this._accessLogsBucket,
      serverAccessLogsPrefix: this._s3AccessLogsPrefix,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const datasetBucket: Bucket = workbenchSecureS3Bucket.bucket;

    new CfnOutput(this, 'ExampleS3DataSetsBucketName', {
      value: datasetBucket.bucketName
    });

    addAccessPointDelegationStatement(datasetBucket);

    const exampleLambda: Function = this._createLambda(
      datasetBucket,
      props.hostingAccountId,
      props.crossAccountRoleName
    );

    const dynamodbEncryptionKey: WorkbenchEncryptionKeyWithRotation = new WorkbenchEncryptionKeyWithRotation(
      this,
      'DynamoDB-EncryptionKey',
      {
        removalPolicy: RemovalPolicy.DESTROY
      }
    );

    // Create DatasetTable
    const datasetTable = this._createDataSetDDBTable(dynamodbEncryptionKey.key, exampleLambda);

    // Create DynamicAuthTable
    const dynamicAuthTable = this._createDynamicAuthDDBTable(dynamodbEncryptionKey.key, exampleLambda);

    exampleLambda.addEnvironment('DATASET_DDB_TABLE_NAME', datasetTable.tableName);
    exampleLambda.addEnvironment('DYNAMIC_AUTH_DDB_TABLE_NAME', dynamicAuthTable.tableName);

    this._createRestApi(exampleLambda);

    //CFN NAG Suppression
    const customResourceLambdaNode = this.node.findChild('AWS679f53fac002430cb0da5b7982bd2287');
    const customResourceLambdaMetaDataNode = customResourceLambdaNode.node.defaultChild as CfnFunction;
    customResourceLambdaMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // Lambda functions require permission to write CloudWatch Logs
        {
          id: 'W58',
          reason:
            'AWSCustomResource Lambda Function has AWSLambdaBasicExecutionRole policy attached which has the required permission to write to Cloudwatch Logs'
        },
        // Lambda functions should be deployed inside a VPC
        {
          id: 'W89',
          reason:
            'AWSCustomResource Lambda Function supports infrastructure deployment and is not deployed inside a VPC'
        },
        // Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions
        {
          id: 'W92',
          reason:
            'AWSCustomResource Lambda Function used for provisioning infrastructure, reserved concurrency is not required'
        }
      ]
    });

    //DatasetBucket autoDelete custom Lambda
    const autoDeleteCustomResourceLambdaNode = this.node.findChild(
      'Custom::S3AutoDeleteObjectsCustomResourceProvider'
    );
    const autoDeleteCustomResourceLambdaMetaDataNode = autoDeleteCustomResourceLambdaNode.node.findChild(
      'Handler'
    ) as CfnFunction;
    autoDeleteCustomResourceLambdaMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // // Lambda functions require permission to write CloudWatch Logs
        {
          id: 'W58',
          reason:
            'AWSCustomResource Lambda Function has AWSLambdaBasicExecutionRole policy attached which has the required permission to write to Cloudwatch Logs'
        },
        // Lambda functions should be deployed inside a VPC
        {
          id: 'W89',
          reason:
            'AWSCustomResource Lambda Function supports infrastructure deployment and is not deployed inside a VPC'
        },
        // Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions
        {
          id: 'W92',
          reason:
            'AWSCustomResource Lambda Function used for provisioning infrastructure, reserved concurrency is not required'
        }
      ]
    });

    new CfnOutput(this, 'MainAccountId', {
      value: Aws.ACCOUNT_ID
    });

    new CfnOutput(this, 'MainAccountRegion', {
      value: Aws.REGION
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource',
      [
        // The IAM user, role, or group uses AWS managed policies.
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
      [
        // The non-container Lambda function is not configured to use the latest runtime version.
        { id: 'AwsSolutions-L1', reason: 'This is an AWSCustom Resource Lambda Function, I am ok with this' }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/ExampleLambdaRole/DefaultPolicy/Resource',
      [
        // The IAM entity contains wildcard permissions and does not have a cdk-nag rule suppression with evidence for those permission.
        {
          id: 'AwsSolutions-IAM5',
          reason: 'I am OK with using wildcard here'
        }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleStack/ExampleRestApi/CloudWatchRole/Resource',
      [
        // The IAM user, role, or group uses AWS managed policies.
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
      // The REST API stage is not associated with AWS WAFv2 web ACL.
      { id: 'AwsSolutions-APIG3', reason: 'I am ok with not using WAFv2, this is an example App' },
      // The REST API Stage does not have CloudWatch logging enabled for all methods.
      {
        id: 'AwsSolutions-APIG6',
        reason: 'I am ok with not enabling Cloudwatch logging at stage level, this is an example App'
      },
      // The API does not implement authorization.
      { id: 'AwsSolutions-APIG4', reason: '@aws/workbench-core-authorization implemented at app level' },
      // The API GW method does not use a Cognito user pool authorizer.
      { id: 'AwsSolutions-COG4', reason: '@aws/workbench-core-authorization implemented at app level' }
    ]);
  }

  // Create DatasetDDBTable
  private _createDataSetDDBTable(encryptionKey: Key, lambda: Function): Table {
    const dataSetTable: WorkbenchDynamodb = new WorkbenchDynamodb(this, `ExampleDatasetTable`, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      encryptionKey: encryptionKey,
      lambdas: [lambda],
      gsis: [
        {
          indexName: 'getResourceByName',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'name', type: AttributeType.STRING }
        },
        {
          indexName: 'getResourceByStatus',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'status', type: AttributeType.STRING }
        },
        {
          indexName: 'getResourceByCreatedAt',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'createdAt', type: AttributeType.STRING }
        },
        {
          indexName: 'getResourceByDependency',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'dependency', type: AttributeType.STRING }
        },
        {
          indexName: 'getResourceByOwner',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'owner', type: AttributeType.STRING }
        },
        {
          indexName: 'getResourceByType',
          partitionKey: { name: 'resourceType', type: AttributeType.STRING },
          sortKey: { name: 'type', type: AttributeType.STRING }
        }
      ]
    });

    // eslint-disable-next-line no-new
    new CfnOutput(this, 'ExampleDataSetDDBTableArn', {
      value: dataSetTable.table.tableArn
    });
    // eslint-disable-next-line no-new
    new CfnOutput(this, 'ExampleDataSetDDBTableName', {
      value: dataSetTable.table.tableName
    });

    return dataSetTable.table;
  }

  // Create DynamicAuthDDBTable
  private _createDynamicAuthDDBTable(encryptionKey: Key, lambda: Function): Table {
    const dynamicAuthDDBTable = new WorkbenchDynamodb(this, `ExampleDynamicAuthTable`, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      encryptionKey: encryptionKey,
      lambdas: [lambda],
      gsis: [
        {
          indexName: 'getIdentityPermissionsByIdentity',
          partitionKey: { name: 'identity', type: AttributeType.STRING },
          sortKey: { name: 'pk', type: AttributeType.STRING }
        }
      ],
      timeToLiveAttribute: 'expirationTime'
    });

    // eslint-disable-next-line no-new
    new CfnOutput(this, 'ExampleDynamicAuthDDBTableArn', {
      value: dynamicAuthDDBTable.table.tableArn
    });
    // eslint-disable-next-line no-new
    new CfnOutput(this, 'ExampleDynamicAuthDDBTableName', {
      value: dynamicAuthDDBTable.table.tableName
    });

    return dynamicAuthDDBTable.table;
  }

  private _createRestApi(exampleLambda: Function): void {
    const logGroup = new LogGroup(this, 'ExampleAPIGatewayAccessLogs');

    const logGroupNode = logGroup.node.defaultChild as CfnLogGroup;
    logGroupNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // CloudWatchLogs LogGroup should specify a KMS Key Id to encrypt the log data
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
        // resources should be associated with an AWS::ApiGateway::UsagePlan
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
        // AWS::ApiGateway::Stage resources should be associated with an AWS::ApiGateway::UsagePlan
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
        // AWS::ApiGateway::Method should not have AuthorizationType set to 'NONE' unless it is of HttpMethod: OPTIONS.
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
        // AWS::ApiGateway::Method should not have AuthorizationType set to 'NONE' unless it is of HttpMethod: OPTIONS.
        {
          id: 'W59',
          reason: 'Making use of custom Authorization at the App level, this is ok !'
        }
      ]
    });

    NagSuppressions.addResourceSuppressions(
      API,
      [
        // The REST API does not have request validation enabled
        {
          id: 'AwsSolutions-APIG2',
          reason: 'I am OK with not enabling request validation for Rest API, this is an example App'
        }
      ],
      true
    );
  }

  private _createLambda(
    datasetBucket: Bucket,
    hostingAccountId: string,
    crossAccountRoleName: string
  ): Function {
    const exampleLambdaRole = new Role(this, 'ExampleLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });

    exampleLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const exampleLambda: Function = new Function(this, 'ExampleLambdaService', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'buildLambda.handler',
      code: Code.fromAsset('build'),
      functionName: 'ExampleLambda',
      environment: this._exampleLambdaEnvVars,
      timeout: Duration.seconds(29), // Integration timeout should be 29 seconds https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
      memorySize: 832,
      role: exampleLambdaRole
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
            'cognito-idp:AdminEnableUser',
            'cognito-idp:AdminDisableUser',
            'cognito-idp:CreateGroup',
            'cognito-idp:DeleteGroup',
            'cognito-idp:ListGroups',
            'cognito-idp:ListUsers',
            'cognito-idp:ListUsersInGroup'
          ],
          resources: ['*']
        }),
        new PolicyStatement({
          sid: 'crossAccountS3DatasetAccess',
          actions: ['sts:AssumeRole'],
          resources: [`arn:${Aws.PARTITION}:iam::${hostingAccountId}:role/${crossAccountRoleName}`]
        })
      ]
    });

    //CFN NAG Suppression
    const exampleLambdaNode = exampleLambda.node.defaultChild as CfnFunction;
    exampleLambdaNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // Lambda functions require permission to write CloudWatch Logs
        {
          id: 'W58',
          reason: 'Lambda Function has permission to write to Cloudwatch Logs in exampleLambdaPolicy'
        },
        // Lambda functions should be deployed inside a VPC
        {
          id: 'W89',
          reason: 'This is an example Lambda Function for integration test and is not deployed inside a VPC'
        },
        // Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions
        {
          id: 'W92',
          reason: 'This is an example Lambda Function, reserved concurrency is not required'
        }
      ]
    });

    const exampleLambdaPolicyNode = exampleLambdaPolicy.node.defaultChild as CfnPolicy;
    exampleLambdaPolicyNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W12',
          reason: 'I am ok with using wildcard here !'
        },
        {
          id: 'W76',
          reason: 'All Policies are required'
        }
      ]
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressions(
      exampleLambdaPolicy,
      [
        // The IAM entity contains wildcard permissions and does not have a cdk-nag rule suppression with evidence for those permission.
        {
          id: 'AwsSolutions-IAM5',
          reason: 'I am OK with using wildcard here'
        }
      ],
      true
    );

    exampleLambdaRole.attachInlinePolicy(exampleLambdaPolicy);

    new CfnOutput(this, 'ExampleLambdaRoleOutput', {
      value: exampleLambdaRole.roleArn
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressions(
      exampleLambdaRole,
      [
        // The IAM user, role, or group uses AWS managed policies.
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
      webUiUserPoolClientName: `${userPoolClientName}-webUi`,
      programmaticAccessUserPoolName: `${userPoolClientName}-iTest`,
      oidcIdentityProviders: [],
      // Extend access token expiration to 60 minutes to allow integration tests to run successfully. Once MAFoundation-310 has been implemented to allow multiple clientIds, we'll create a separate client for integration tests and the "main" client access token expiration time can be return to 15 minutes
      webUiUserPoolTokenValidity: {
        accessTokenValidity: Duration.minutes(60)
      },
      programmaticAccessUserPoolTokenValidity: {
        accessTokenValidity: Duration.minutes(60)
      },
      removalPolicy: RemovalPolicy.DESTROY
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

    new CfnOutput(this, 'ExampleCognitoWebUiUserPoolClientId', {
      value: workbenchCognito.webUiUserPoolClientId,
      exportName: 'ExampleCognitoWebUiUserPoolClientId'
    });

    new CfnOutput(this, 'ExampleCognitoIntegrationTestUserPoolClientId', {
      value: workbenchCognito.programmaticAccessUserPoolClientId,
      exportName: 'ExampleCognitoIntegrationTestUserPoolClientId'
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
        // The Cognito user pool does not have a password policy that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters.
        {
          id: 'AwsSolutions-COG1',
          reason: 'Using the default configuration from @aws/workbench-core-infrastructure package'
        },
        // The Cognito user pool does not require MFA.
        {
          id: 'AwsSolutions-COG2',
          reason: 'This is an example package for integration test, selecting default MFA Optional'
        }
      ]
    );

    return workbenchCognito;
  }
}
