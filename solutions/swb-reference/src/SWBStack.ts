/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { join } from 'path';
import { WorkbenchCognito, WorkbenchCognitoProps } from '@amzn/workbench-core-infrastructure';

import { App, aws_iam, CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';

import * as targets from 'aws-cdk-lib/aws-events-targets';

import {
  AnyPrincipal,
  Effect,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Alias, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { getConstants } from './constants';
import Workflow from './environment/workflow';

export class SWBStack extends Stack {
  // We extract a subset of constants required to be set on Lambda
  // Note: AWS_REGION cannot be set since it's a reserved env variable
  public lambdaEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    AMI_IDS_TO_SHARE: string;
    LAUNCH_CONSTRAINT_ROLE_NAME: string;
    S3_ARTIFACT_BUCKET_ARN_NAME: string;
    S3_DATASETS_BUCKET_ARN_NAME: string;
    STATUS_HANDLER_ARN_NAME: string;
    SC_PORTFOLIO_NAME: string;
    ALLOWED_ORIGINS: string;
    COGNITO_DOMAIN: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    USER_POOL_ID: string;
    WEBSITE_URL: string;
  };

  private _accessLogsBucket: Bucket;
  private _s3AccessLogsPrefix: string;

  public constructor(app: App) {
    const {
      STAGE,
      AWS_REGION,
      S3_ACCESS_BUCKET_ARN_NAME,
      S3_ACCESS_BUCKET_PREFIX,
      S3_ARTIFACT_BUCKET_ARN_NAME,
      S3_DATASETS_BUCKET_ARN_NAME,
      LAUNCH_CONSTRAINT_ROLE_NAME,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      AMI_IDS_TO_SHARE,
      STATUS_HANDLER_ARN_NAME,
      SC_PORTFOLIO_NAME,
      ALLOWED_ORIGINS,
      COGNITO_DOMAIN,
      USER_POOL_CLIENT_NAME,
      USER_POOL_NAME,
      WEBSITE_URL,
      USER_POOL_ID,
      CLIENT_ID,
      CLIENT_SECRET
    } = getConstants();

    super(app, STACK_NAME, {
      env: {
        region: AWS_REGION
      }
    });

    const workbenchCognito = this._createCognitoResources(
      COGNITO_DOMAIN,
      WEBSITE_URL,
      USER_POOL_NAME,
      USER_POOL_CLIENT_NAME
    );

    let cognitoDomain: string;
    let clientId: string;
    let clientSecret: string;
    let userPoolId: string;
    if (process.env.LOCAL_DEVELOPMENT === 'true') {
      cognitoDomain = `https://${COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com`;
      clientId = CLIENT_ID;
      clientSecret = CLIENT_SECRET;
      userPoolId = USER_POOL_ID;
    } else {
      cognitoDomain = workbenchCognito.cognitoDomain;
      clientId = workbenchCognito.userPoolClientId;
      clientSecret = workbenchCognito.userPoolClientSecret.unsafeUnwrap();
      userPoolId = workbenchCognito.userPoolId;
    }

    // We extract a subset of constants required to be set on Lambda
    // Note: AWS_REGION cannot be set since it's a reserved env variable
    this.lambdaEnvVars = {
      STAGE,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      AMI_IDS_TO_SHARE,
      LAUNCH_CONSTRAINT_ROLE_NAME,
      S3_ARTIFACT_BUCKET_ARN_NAME,
      S3_DATASETS_BUCKET_ARN_NAME,
      STATUS_HANDLER_ARN_NAME,
      SC_PORTFOLIO_NAME,
      ALLOWED_ORIGINS,
      COGNITO_DOMAIN: cognitoDomain,
      CLIENT_ID: clientId,
      CLIENT_SECRET: clientSecret,
      USER_POOL_ID: userPoolId,
      WEBSITE_URL
    };
    this._s3AccessLogsPrefix = S3_ACCESS_BUCKET_PREFIX;
    this._accessLogsBucket = this._createAccessLogsBucket(S3_ACCESS_BUCKET_ARN_NAME);
    const datasetsBucket = this._createS3DatasetsBuckets(S3_DATASETS_BUCKET_ARN_NAME);
    const artifactS3Bucket = this._createS3ArtifactsBuckets(S3_ARTIFACT_BUCKET_ARN_NAME);
    const lcRole = this._createLaunchConstraintIAMRole(LAUNCH_CONSTRAINT_ROLE_NAME);
    const createAccountHandler = this._createAccountHandlerLambda(lcRole, artifactS3Bucket);
    const statusHandler = this._createStatusHandlerLambda(datasetsBucket);
    const apiLambda: Function = this._createAPILambda(datasetsBucket, artifactS3Bucket);
    this._createDDBTable(apiLambda, statusHandler, createAccountHandler);
    this._createRestApi(apiLambda);

    const workflow = new Workflow(this);
    workflow.createSSMDocuments();
  }

  private _createLaunchConstraintIAMRole(launchConstraintRoleNameOutput: string): Role {
    const commonScManagement = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [
            'iam:GetRole',
            'iam:GetRolePolicy',
            'iam:*TagRole*',
            'iam:PassRole',
            'iam:DeleteRole',
            'iam:PutRolePolicy',
            'iam:DeleteRolePolicy',
            'iam:DetachRolePolicy',
            'iam:AttachRolePolicy',
            'iam:CreateRole'
          ],
          resources: [
            'arn:aws:iam::*:role/analysis-*',
            'arn:aws:iam::*:role/SC-*-ServiceRole-*',
            'arn:aws:iam::*:role/*-sagemaker-notebook-role'
          ]
        }),
        new PolicyStatement({
          actions: [
            'iam:AddRoleToInstanceProfile',
            'iam:CreateInstanceProfile',
            'iam:GetInstanceProfile',
            'iam:DeleteInstanceProfile',
            'iam:RemoveRoleFromInstanceProfile'
          ],
          resources: [
            'arn:aws:iam::*:instance-profile/analysis-*',
            'arn:aws:iam::*:instance-profile/SC-*-InstanceProfile-*'
          ]
        }),
        new PolicyStatement({
          actions: ['iam:GetPolicy', 'iam:CreatePolicy', 'iam:ListPolicyVersions', 'iam:DeletePolicy'],
          resources: ['arn:aws:iam::*:policy/*-permission-boundary']
        }),
        new PolicyStatement({
          actions: [
            'cloudformation:CreateStack',
            'cloudformation:DescribeStacks',
            'cloudformation:DescribeStackEvents',
            'cloudformation:DeleteStack'
          ],
          resources: ['arn:aws:cloudformation:*:*:stack/SC-*/*']
        }),
        new PolicyStatement({
          actions: ['cloudformation:GetTemplateSummary'],
          resources: ['*']
        }),
        new PolicyStatement({
          actions: ['s3:GetObject'],
          resources: ['arn:aws:s3:::sc-*']
        }),
        new PolicyStatement({
          actions: [
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:AuthorizeSecurityGroupEgress',
            'ec2:RevokeSecurityGroupEgress',
            'ec2:CreateSecurityGroup',
            'ec2:DeleteSecurityGroup',
            'ec2:CreateTags',
            'ec2:DescribeTags',
            'ec2:DescribeKeyPairs',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeVpcs'
          ],
          resources: ['*']
        }),
        new PolicyStatement({
          actions: ['kms:CreateGrant'],
          resources: ['*']
        })
      ]
    });
    const sagemakerNotebookPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [
            'sagemaker:DescribeNotebookInstanceLifecycleConfig',
            'sagemaker:CreateNotebookInstanceLifecycleConfig',
            'sagemaker:DeleteNotebookInstanceLifecycleConfig'
          ],
          resources: [
            'arn:aws:sagemaker:*:*:notebook-instance-lifecycle-config/basicnotebookinstancelifecycleconfig-*'
          ]
        }),
        new PolicyStatement({
          actions: [
            'sagemaker:DescribeNotebookInstance',
            'sagemaker:CreateNotebookInstance',
            'sagemaker:StopNotebookInstance',
            'sagemaker:StopNotebookInstance',
            'sagemaker:DeleteNotebookInstance'
          ],
          resources: ['arn:aws:sagemaker:*:*:notebook-instance/basicnotebookinstance-*']
        }),
        new PolicyStatement({
          actions: ['s3:GetObject'],
          resources: ['*']
        }),
        new PolicyStatement({
          actions: [
            'cloudformation:CreateStack',
            'cloudformation:DeleteStack',
            'cloudformation:DescribeStackEvents',
            'cloudformation:DescribeStacks',
            'cloudformation:GetTemplateSummary',
            'cloudformation:SetStackPolicy',
            'cloudformation:ValidateTemplate',
            'cloudformation:UpdateStack'
          ],
          resources: ['arn:aws:cloudformation:*:*:stack/SC-*']
        }),
        new PolicyStatement({
          actions: [
            'ec2:DescribeNetworkInterfaces',
            'ec2:CreateNetworkInterface',
            'ec2:DeleteNetworkInterface'
          ],
          resources: ['*']
        })
      ]
    });

    const iamRole = new Role(this, 'LaunchConstraint', {
      assumedBy: new ServicePrincipal('servicecatalog.amazonaws.com'),
      roleName: `${this.stackName}-LaunchConstraint`,
      description: 'Launch constraint role for Service Catalog products',
      inlinePolicies: {
        sagemakerNotebookLaunchPermissions: sagemakerNotebookPolicy,
        commonScManagement
      }
    });

    new CfnOutput(this, launchConstraintRoleNameOutput, {
      value: iamRole.roleName
    });
    return iamRole;
  }

  /**
   * Create bucket for S3 access logs.
   * Note this bucket does not have sigv4/https policies because these restrict access log delivery.
   * @param bucketName Name of Access Logs Bucket.
   * @returns S3Bucket
   */
  private _createAccessLogsBucket(bucketName: string): Bucket {
    const s3Bucket = new Bucket(this, 's3-access-logs', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    return s3Bucket;
  }

  private _addS3TLSSigV4BucketPolicy(s3Bucket: Bucket): void {
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny requests that do not use TLS/HTTPS',
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.bucketArn, s3Bucket.arnForObjects('*')],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false'
          }
        }
      })
    );
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny requests that do not use SigV4',
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.arnForObjects('*')],
        conditions: {
          StringNotEquals: {
            's3:signatureversion': 'AWS4-HMAC-SHA256'
          }
        }
      })
    );
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
            's3:DataAccessPointAccount': this.account
          }
        }
      })
    );
  }

  private _createS3ArtifactsBuckets(s3ArtifactName: string): Bucket {
    return this._createSecureS3Bucket('s3-artifacts', s3ArtifactName);
  }

  private _createS3DatasetsBuckets(s3DatasetsName: string): Bucket {
    const bucket: Bucket = this._createSecureS3Bucket('s3-datasets', s3DatasetsName);
    this._addAccessPointDelegationStatement(bucket);
    return bucket;
  }

  private _createSecureS3Bucket(s3BucketId: string, s3OutputId: string): Bucket {
    const s3Bucket = new Bucket(this, s3BucketId, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsBucket: this._accessLogsBucket,
      serverAccessLogsPrefix: this._s3AccessLogsPrefix
    });
    this._addS3TLSSigV4BucketPolicy(s3Bucket);
    this._setupAccessLogsBucketPolicy(s3Bucket);

    new CfnOutput(this, s3OutputId, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }

  private _setupAccessLogsBucketPolicy(sourceBucket: Bucket): void {
    this._accessLogsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${this._accessLogsBucket.bucketArn}/${this._s3AccessLogsPrefix}*`],
        conditions: {
          ArnLike: {
            'aws:SourceArn': sourceBucket.bucketArn
          },
          StringEquals: {
            'aws:SourceAccount': process.env.CDK_DEFAULT_ACCOUNT
          }
        }
      })
    );
  }

  private _createStatusHandlerLambda(datasetBucket: Bucket): Function {
    const statusHandlerLambda = new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars,
      timeout: Duration.seconds(60),
      memorySize: 256
    });

    statusHandlerLambda.addPermission('RouteHostEvents', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal('events.amazonaws.com')
    });

    statusHandlerLambda.role?.attachInlinePolicy(
      new Policy(this, 'statusHandlerLambdaPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: ['arn:aws:iam::*:role/*env-mgmt'],
            sid: 'AssumeRole'
          }),
          new PolicyStatement({
            sid: 'datasetS3Access',
            actions: [
              's3:GetObject',
              's3:GetObjectVersion',
              's3:GetObjectTagging',
              's3:AbortMultipartUpload',
              's3:ListMultipartUploadParts',
              's3:PutObject',
              's3:PutObjectAcl',
              's3:PutObjectTagging',
              's3:ListBucket',
              's3:PutAccessPointPolicy',
              's3:GetAccessPointPolicy'
            ],
            resources: [
              datasetBucket.bucketArn,
              `${datasetBucket.bucketArn}/*`,
              `arn:aws:s3:${this.region}:${this.account}:accesspoint/*`
            ]
          })
        ]
      })
    );

    new CfnOutput(this, 'StatusHandlerLambdaRoleOutput', {
      value: statusHandlerLambda.role!.roleArn
    });

    new CfnOutput(this, 'StatusHandlerLambdaArnOutput', {
      value: statusHandlerLambda.functionArn
    });

    return statusHandlerLambda;
  }

  private _createAccountHandlerLambda(launchConstraintRole: Role, artifactS3Bucket: Bucket): Function {
    const lambda = new Function(this, 'accountHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/accountHandler')),
      handler: 'accountHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars,
      memorySize: 256,
      timeout: Duration.minutes(4)
    });

    lambda.role?.attachInlinePolicy(
      new Policy(this, 'accountHandlerPolicy', {
        statements: [
          new PolicyStatement({
            sid: 'CreatePortfolioShare',
            actions: ['servicecatalog:CreatePortfolioShare'],
            resources: [`arn:aws:catalog:${this.region}:${this.account}:portfolio/*`]
          }),
          // Allows accountHandler to get portfolioId based on portfolioName
          // '*/*' is the minimum permission required because ListPortfolios API does not allow filtering
          new PolicyStatement({
            sid: 'ListPortfolios',
            actions: ['servicecatalog:ListPortfolios'],
            resources: [`arn:aws:servicecatalog:${this.region}:${this.account}:*/*`]
          }),
          new PolicyStatement({
            sid: 'AssumeRole',
            actions: ['sts:AssumeRole'],
            // Confirm the suffix `hosting-account-role` matches with the suffix in `onboard-account.cfn.yaml`
            resources: ['arn:aws:iam::*:role/*hosting-account-role']
          }),
          new PolicyStatement({
            sid: 'GetLaunchConstraint',
            actions: [
              'iam:GetRole',
              'iam:GetRolePolicy',
              'iam:ListRolePolicies',
              'iam:ListAttachedRolePolicies'
            ],
            resources: [launchConstraintRole.roleArn]
          }),
          new PolicyStatement({
            sid: 'ShareAmi',
            actions: ['ec2:ModifyImageAttribute'],
            resources: ['*']
          }),
          new PolicyStatement({
            sid: 'ShareSSM',
            actions: ['ssm:ModifyDocumentPermission'],
            resources: [
              this.formatArn({ service: 'ssm', resource: 'document', resourceName: `${this.stackName}-*` })
            ]
          }),
          new PolicyStatement({
            sid: 'Cloudformation',
            actions: ['cloudformation:DescribeStacks'],
            resources: [this.stackId]
          }),
          new PolicyStatement({
            sid: 'S3Bucket',
            actions: ['s3:GetObject'],
            resources: [`${artifactS3Bucket.bucketArn}/*`]
          })
        ]
      })
    );

    new CfnOutput(this, 'AccountHandlerLambdaRoleOutput', {
      value: lambda.role!.roleArn
    });

    // Run lambda function every 5 minutes
    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '0/5' })
    });
    eventRule.addTarget(new targets.LambdaFunction(lambda));

    return lambda;
  }

  private _createAPILambda(datasetBucket: Bucket, artifactS3Bucket: Bucket): Function {
    const { AWS_REGION } = getConstants();

    const apiLambda = new Function(this, 'apiLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/backendAPI')),
      handler: 'backendAPILambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars,
      timeout: Duration.seconds(29), // Integration timeout should be 29 seconds https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
      memorySize: 832
    });
    apiLambda.role?.attachInlinePolicy(
      new Policy(this, 'apiLambdaPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['events:PutPermission'],
            resources: [`arn:aws:events:${AWS_REGION}:${this.account}:event-bus/default`],
            sid: 'EventBridgeAccess'
          }),
          new PolicyStatement({
            actions: ['cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents'],
            resources: [`arn:aws:cloudformation:${AWS_REGION}:*:stack/${this.stackName}*`],
            sid: 'CfnAccess'
          }),
          new PolicyStatement({
            actions: ['servicecatalog:ListLaunchPaths'],
            resources: [`arn:aws:catalog:${AWS_REGION}:*:product/*`],
            sid: 'ScAccess'
          }),
          new PolicyStatement({
            actions: ['cognito-idp:DescribeUserPoolClient'],
            resources: [`arn:aws:cognito-idp:${AWS_REGION}:${this.account}:userpool/*`],
            sid: 'CognitoAccess'
          }),
          new PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: ['arn:aws:iam::*:role/*env-mgmt', 'arn:aws:iam::*:role/*hosting-account-role'],
            sid: 'AssumeRole'
          }),
          new PolicyStatement({
            actions: ['events:DescribeRule', 'events:Put*'],
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
            sid: 'environmentBootstrapS3Access',
            actions: ['s3:GetObject', 's3:GetBucketPolicy', 's3:PutBucketPolicy'],
            resources: [artifactS3Bucket.bucketArn, `${artifactS3Bucket.bucketArn}/*`]
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

    new CfnOutput(this, 'ApiLambdaRoleOutput', {
      value: apiLambda.role!.roleArn
    });

    return apiLambda;
  }

  // API Gateway
  private _createRestApi(apiLambda: Function): void {
    const API: RestApi = new RestApi(this, `API-Gateway API`, {
      restApiName: 'Backend API Name',
      description: 'Backend API',
      deployOptions: {
        stageName: 'dev'
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'Set-Cookie'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: JSON.parse(this.lambdaEnvVars.ALLOWED_ORIGINS || '[]')
      }
    });

    new CfnOutput(this, 'apiUrlOutput', {
      value: API.url
    });

    if (process.env.LOCAL_DEVELOPMENT === 'true') {
      // SAM local start-api doesn't work with ALIAS so this is the workaround to allow us to run the code locally
      // https://github.com/aws/aws-sam-cli/issues/2227
      API.root.addProxy({
        defaultIntegration: new LambdaIntegration(apiLambda)
      });
    } else {
      const alias = new Alias(this, 'LiveAlias', {
        aliasName: 'live',
        version: apiLambda.currentVersion,
        provisionedConcurrentExecutions: 1
      });
      API.root.addProxy({
        defaultIntegration: new LambdaIntegration(alias)
      });
    }
  }

  // DynamoDB Table
  private _createDDBTable(
    apiLambda: Function,
    statusHandler: Function,
    createAccountHandler: Function
  ): Table {
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
    table.grantReadWriteData(apiLambda);
    table.grantReadWriteData(statusHandler);
    table.grantReadWriteData(createAccountHandler);
    new CfnOutput(this, 'dynamoDBTableOutput', { value: table.tableArn });
    return table;
  }

  private _createCognitoResources(
    domainPrefix: string,
    websiteUrl: string,
    userPoolName: string,
    userPoolClientName: string
  ): WorkbenchCognito {
    const props: WorkbenchCognitoProps = {
      domainPrefix: domainPrefix,
      websiteUrl: websiteUrl,
      userPoolName: userPoolName,
      userPoolClientName: userPoolClientName,
      oidcIdentityProviders: []
    };

    const workbenchCognito = new WorkbenchCognito(this, 'ServiceWorkbenchCognito', props);

    new CfnOutput(this, 'cognitoUserPoolId', {
      value: workbenchCognito.userPoolId
    });

    new CfnOutput(this, 'cognitoUserPoolClientId', {
      value: workbenchCognito.userPoolClientId
    });

    new CfnOutput(this, 'cognitoDomainName', {
      value: workbenchCognito.cognitoDomain
    });

    return workbenchCognito;
  }
}
