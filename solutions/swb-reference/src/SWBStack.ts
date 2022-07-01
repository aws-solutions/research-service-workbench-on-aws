/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { join } from 'path';
import { App, CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';

import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Alias, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
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
    STATUS_HANDLER_ARN_NAME: string;
    SC_PORTFOLIO_NAME: string;
    PCLUSTER_API_URL: string;
    ALLOWED_ORIGINS: string;
  };
  public constructor(app: App) {
    const {
      STAGE,
      AWS_REGION,
      S3_ARTIFACT_BUCKET_ARN_NAME,
      LAUNCH_CONSTRAINT_ROLE_NAME,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      AMI_IDS_TO_SHARE,
      STATUS_HANDLER_ARN_NAME,
      SC_PORTFOLIO_NAME,
      PCLUSTER_API_URL
      ALLOWED_ORIGINS
    } = getConstants();

    super(app, STACK_NAME, {
      env: {
        region: AWS_REGION
      }
    });

    // We extract a subset of constants required to be set on Lambda
    // Note: AWS_REGION cannot be set since it's a reserved env variable
    this.lambdaEnvVars = {
      STAGE,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      AMI_IDS_TO_SHARE,
      LAUNCH_CONSTRAINT_ROLE_NAME,
      S3_ARTIFACT_BUCKET_ARN_NAME,
      STATUS_HANDLER_ARN_NAME,
      SC_PORTFOLIO_NAME,
      PCLUSTER_API_URL
      ALLOWED_ORIGINS
    };

    const statusHandler = this._createStatusHandlerLambda();
    const apiLambda: Function = this._createAPILambda(statusHandler.functionArn);
    const table = this._createDDBTable(apiLambda);
    this._createRestApi(apiLambda);

    const artifactS3Bucket = this._createS3Buckets(S3_ARTIFACT_BUCKET_ARN_NAME);
    const lcRole = this._createLaunchConstraintIAMRole(LAUNCH_CONSTRAINT_ROLE_NAME);
    this._createAccountHandlerLambda(lcRole, artifactS3Bucket, table.tableArn);

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
    const sagemakerPolicy = new PolicyDocument({
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
          actions: ['servicecatalog:*'],
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
        sagemakerLaunchPermissions: sagemakerPolicy,
        commonScManagement
      }
    });

    new CfnOutput(this, launchConstraintRoleNameOutput, {
      value: iamRole.roleName
    });
    return iamRole;
  }

  private _createS3Buckets(s3ArtifactName: string): Bucket {
    const s3Bucket = new Bucket(this, 's3-artifacts', {});

    new CfnOutput(this, s3ArtifactName, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }

  private _createStatusHandlerLambda(): Function {
    const statusHandlerLambda = new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars,
      timeout: Duration.seconds(60)
    });

    statusHandlerLambda.addPermission('RouteHostEvents', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal('events.amazonaws.com')
    });

    statusHandlerLambda.role?.attachInlinePolicy(
      new Policy(this, 'statusHandlerLambdaPolicy', {
        statements: [
          // TODO: Restrict policy permissions
          new PolicyStatement({
            actions: ['dynamodb:*'],
            resources: ['*'],
            sid: 'DynamoDBAccess'
          }),
          new PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: ['arn:aws:iam::*:role/*env-mgmt'],
            sid: 'AssumeRole'
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

  private _createAccountHandlerLambda(
    launchConstraintRole: Role,
    artifactS3Bucket: Bucket,
    ddbTableArn: string
  ): void {
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
          }),
          new PolicyStatement({
            actions: ['dynamodb:*'],
            resources: [ddbTableArn, `${ddbTableArn}/index/*`],
            sid: 'DynamoDBAccess'
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
  }

  private _createAPILambda(statusHandlerLambdaArn: string): Function {
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
          // TODO: Restrict policy permissions
          new PolicyStatement({
            actions: ['dynamodb:*'],
            resources: ['*'],
            sid: 'DynamoDBAccess'
          }),
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
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000']
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
  private _createDDBTable(apiLambda: Function): Table {
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
    // Grant the Lambda Function read access to the DynamoDB table
    table.grantReadWriteData(apiLambda);
    new CfnOutput(this, 'dynamoDBTableOutput', { value: table.tableArn });
    return table;
  }
}