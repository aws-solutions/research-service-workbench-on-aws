/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { EventBus, Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, CfnOutput, Stack } from 'aws-cdk-lib';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { join } from 'path';
import Workflow from './environment/workflow';
import { Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { getConstants } from './constants';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class SWBStack extends Stack {
  // We extract a subset of constants required to be set on Lambda
  // Note: AWS_REGION cannot be set since it's a reserved env variable
  public lambdaEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    MAIN_ACCOUNT_BUS_ARN_NAME: string;
    AMI_IDS_TO_SHARE: string;
    EXTERNAL_ID: string;
  };
  public constructor(app: App) {
    const {
      STAGE,
      AWS_REGION,
      S3_ARTIFACT_BUCKET_ARN_NAME,
      LAUNCH_CONSTRAINT_ROLE_NAME,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      MAIN_ACCOUNT_BUS_ARN_NAME,
      AMI_IDS_TO_SHARE,
      EXTERNAL_ID
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
      MAIN_ACCOUNT_BUS_ARN_NAME,
      AMI_IDS_TO_SHARE,
      EXTERNAL_ID
    };

    const apiLambdaRole: Role = this._createAPILambdaRole();
    const apiLambda: Function = this._createAPILambda(apiLambdaRole);
    this._createRestApi(apiLambda);

    this._createStatusHandlerLambda();
    const lcRole = this._createLaunchConstraintIAMRole(LAUNCH_CONSTRAINT_ROLE_NAME);
    this._createAccountHandlerLambda(lcRole);

    const workflow = new Workflow(this);
    workflow.createSSMDocuments();

    this._createEventBridgeResources();
    this._createS3Buckets(S3_ARTIFACT_BUCKET_ARN_NAME);

    this._createDDBTable(apiLambda);
  }

  private _createLaunchConstraintIAMRole(launchConstraintRoleNameOutput: string): Role {
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
        sagemakerLaunchPermissions: sagemakerPolicy
      }
    });

    new CfnOutput(this, launchConstraintRoleNameOutput, {
      value: iamRole.roleName
    });
    return iamRole;
  }

  private _createS3Buckets(s3ArtifactName: string): void {
    const s3Bucket = new Bucket(this, 's3-artifacts', {});

    new CfnOutput(this, s3ArtifactName, {
      value: s3Bucket.bucketArn
    });
  }

  private _createEventBridgeResources(): void {
    const bus = new EventBus(this, 'bus', {
      eventBusName: this.stackName
    });

    new CfnOutput(this, 'EventBusOutput', {
      value: bus.eventBusArn
    });
  }

  private _createStatusHandlerLambda(): void {
    const statusHandlerLambda = new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars
    });

    new CfnOutput(this, 'statusHandlerLambdaRoleOutput', {
      value: statusHandlerLambda.role!.roleArn
    });
  }

  private _createAccountHandlerLambda(launchConstraintRole: Role): void {
    const lambda = new Function(this, 'accountHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/accountHandler')),
      handler: 'accountHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars
    });

    const createPortfolioSharePolicy = new PolicyStatement({
      actions: ['servicecatalog:CreatePortfolioShare'],
      resources: [`arn:aws:catalog:${this.region}:${this.account}:portfolio/*`]
    });

    const assumeRolePolicy = new PolicyStatement({
      actions: ['sts:AssumeRole'],
      // Confirm the suffix `cross-account-role` matches with the suffix in `onboard-account.cfn.yaml`
      resources: [`arn:aws:iam::*:role/${this.stackName}-cross-account-role`]
    });

    const getLaunchConstraintPolicy = new PolicyStatement({
      actions: ['iam:GetRole', 'iam:GetRolePolicy', 'iam:ListRolePolicies', 'iam:ListAttachedRolePolicies'],
      resources: [launchConstraintRole.roleArn]
    });

    const shareAmiPolicy = new PolicyStatement({
      actions: ['ec2:ModifyImageAttribute'],
      resources: ['*']
    });

    const shareSSMPolicy = new PolicyStatement({
      actions: ['ssm:ModifyDocumentPermission'],
      resources: [
        this.formatArn({ service: 'ssm', resource: 'document', resourceName: `${this.stackName}-*` })
      ]
    });

    const cloudformationPolicy = new PolicyStatement({
      actions: ['cloudformation:DescribeStacks'],
      resources: [this.stackId]
    });
    lambda.role?.attachInlinePolicy(
      new Policy(this, 'accountHandlerPolicy', {
        statements: [
          createPortfolioSharePolicy,
          assumeRolePolicy,
          getLaunchConstraintPolicy,
          shareAmiPolicy,
          shareSSMPolicy,
          cloudformationPolicy
        ]
      })
    );

    new CfnOutput(this, 'accountHandlerLambdaRoleOutput', {
      value: lambda.role!.roleArn
    });

    // Run lambda function every 5 minutes
    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '0/5' })
    });
    eventRule.addTarget(new targets.LambdaFunction(lambda));
  }

  private _createAPILambdaRole(): Role {
    const { AWS_REGION } = getConstants();
    const apiLambdaRole = new Role(this, 'ApiLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${this.stackName}-ApiLambdaRole`,
      description: 'Role assumed by API routes',
      inlinePolicies: {
        adminPerms: new PolicyDocument({
          statements: [
            // TODO: Restrict policy permissions
            new PolicyStatement({
              actions: ['dynamodb:*'],
              resources: ['*'],
              sid: 'DynamoDBAccess'
            }),
            new PolicyStatement({
              actions: ['cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents'],
              resources: [`arn:aws:cloudformation:${AWS_REGION}:*:stack/${this.stackName}`],
              sid: 'CfnAccess'
            }),
            new PolicyStatement({
              actions: ['servicecatalog:ListLaunchPaths'],
              resources: [`arn:aws:catalog:${AWS_REGION}:*:product/*`],
              sid: 'ScAccess'
            }),
            new PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: ['arn:aws:iam::*:role/*env-mgmt', 'arn:aws:iam::*:role/*cross-account-role'],
              sid: 'AssumeRole'
            })
          ]
        })
      }
    });
    return apiLambdaRole;
  }

  private _createAPILambda(apiLambdaRole: Role): Function {
    const apiLambda = new Function(this, 'apiLambda', {
      code: Code.fromAsset(join(__dirname, '../build/backendAPI')),
      handler: 'backendAPILambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: this.lambdaEnvVars,
      role: apiLambdaRole
    });

    new CfnOutput(this, 'apiLambdaRoleOutput', {
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

    API.root.addProxy({
      defaultIntegration: new LambdaIntegration(apiLambda)
    });
  }

  // DynamoDB Table
  private _createDDBTable(apiLambda: Function): void {
    // Ideally, this needs to involve the solution name
    const tableName: string = `${this.stackName}`;
    const table = new Table(this, tableName, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      tableName: tableName
    });
    // Add GSI for get resource by status
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByStatus',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'status', type: AttributeType.NUMBER }
    });
    // Add GSI for get resource by owner
    table.addGlobalSecondaryIndex({
      indexName: 'getResourceByOwner',
      partitionKey: { name: 'resourceType', type: AttributeType.STRING },
      sortKey: { name: 'owner', type: AttributeType.NUMBER }
    });
    // Grant the Lambda Function read access to the DynamoDB table
    table.grantReadWriteData(apiLambda);
    new CfnOutput(this, 'dynamoDBTableOutput', { value: table.tableArn });
  }
}
