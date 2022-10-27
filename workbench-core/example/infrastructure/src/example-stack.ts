/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { join } from 'path';
import { WorkbenchCognito, WorkbenchCognitoProps } from '@aws/workbench-core-infrastructure';
import { Aws, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, Effect, Policy, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Alias, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EncryptionKeyWithRotation } from './constructs/encryotionKeyWithRotation';
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

    const exampleCognito = this._createExampleCognitoResources(
      'example-express-domain',
      ['http://localhost:3000/'],
      'example-express-userPool',
      'example-express-userPoolClient'
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
      'Example-EncryptionKey'
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

    this._createDDBTable(exampleLambda);

    this._createRestApi(exampleLambda);

    new CfnOutput(this, 'AwsRegion', {
      value: Aws.REGION
    });
  }

  // DynamoDB Table
  private _createDDBTable(exampleLambda: Function): Table {
    const tableName: string = `${this.stackName}`;
    const table = new Table(this, tableName, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      tableName: tableName,
      billingMode: BillingMode.PAY_PER_REQUEST
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
    const s3Bucket = new Bucket(this, 'ExampleS3AccessLogs', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED
    });

    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${s3Bucket.bucketArn}/${this._s3AccessLogsPrefix}*`],
        conditions: {
          StringEquals: {
            'aws:SourceAccount': Aws.ACCOUNT_ID
          }
        }
      })
    );

    new CfnOutput(this, bucketNameOutput, {
      value: s3Bucket.bucketName,
      exportName: bucketNameOutput
    });

    return s3Bucket;
  }

  private _createRestApi(exampleLambda: Function): void {
    const logGroup = new LogGroup(this, 'ExampleAPIGatewayAccessLogs');
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
        )
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'CSRF-Token'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000/']
      }
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
  }

  private _createLambda(datasetBucket: Bucket): Function {
    const exampleLambda: Function = new Function(this, 'ExampleLambdaService', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'buildLambda.handler',
      code: Code.fromAsset(join(__dirname, '../../build')),
      functionName: 'ExampleLambda',
      environment: this._exampleLambdaEnvVars,
      timeout: Duration.seconds(29), // Integration timeout should be 29 seconds https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
      memorySize: 832
    });

    exampleLambda.role?.attachInlinePolicy(
      new Policy(this, 'ExampleLambdaPolicy', {
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
            actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
            resources: ['*']
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
      })
    );

    new CfnOutput(this, 'ExampleLambdaRoleOutput', {
      value: exampleLambda.role!.roleArn
    });

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

    return workbenchCognito;
  }
}
