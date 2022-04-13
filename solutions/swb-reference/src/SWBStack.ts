/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */
/* eslint-disable */
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

export class SWBStack extends Stack {
  public constructor(app: App) {
    const { STACK_NAME, AWS_REGION, S3_ARTIFACT_BUCKET_ARN_NAME, LAUNCH_CONSTRAINT_ROLE_NAME } =
      getConstants();
    super(app, STACK_NAME, {
      env: {
        region: AWS_REGION
      }
    });

    const apiLambda: Function = this._createAPILambda();
    this._createRestApi(apiLambda);

    this._createStatusHandlerLambda();
    this._createAccountHandlerLambda();

    const workflow = new Workflow(this);
    workflow.createSSMDocuments();

    this._createEventBridgeResources();
    this._createS3Buckets(S3_ARTIFACT_BUCKET_ARN_NAME);
    this._createLaunchConstraintIAMRole(LAUNCH_CONSTRAINT_ROLE_NAME);
  }

  private _createLaunchConstraintIAMRole(launchConstraintRoleNameOutput: string): void {
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
    new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X
    });
  }

  private _createAccountHandlerLambda(): void {
    const lambda = new Function(this, 'accountHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../build/accountHandler')),
      handler: 'accountHandlerLambda.handler',
      runtime: Runtime.NODEJS_14_X,
      memorySize: 256
    });

    const createPortfolioSharePolicy = new PolicyStatement({
      actions: ['servicecatalog:CreatePortfolioShare'],
      resources: [`arn:aws:catalog:${this.region}:${this.account}:portfolio/*`]
    });
    lambda.role?.attachInlinePolicy(
      new Policy(this, 'portfolioSharePolicy', {
        statements: [createPortfolioSharePolicy]
      })
    );

    const assumeRolePolicy = new PolicyStatement({
      actions: ['sts:AssumeRole'],
      // Confirm the suffix `cross-account-role` matches with the suffix in `onboard-account.cfn.yaml`
      resources: [`arn:aws:iam::*:role/${this.stackName}-cross-account-role`]
    });
    lambda.role?.attachInlinePolicy(
      new Policy(this, 'assumeRolePolicy', {
        statements: [assumeRolePolicy]
      })
    );

    // Run lambda function every 5 minutes
    // const eventRule = new Rule(this, 'scheduleRule', {
    //   schedule: Schedule.cron({ minute: '0/5' })
    // });
    // eventRule.addTarget(new targets.LambdaFunction(lambda));
  }

  private _createAPILambda(): Function {
    // We extract a subset of constants required to be set on Lambda
    // Note: AWS_REGION cannot be set since it's a reserved env variable
    const { STAGE, STACK_NAME, SSM_DOC_NAME_SUFFIX, MAIN_ACCOUNT_BUS_ARN_NAME, AMI_IDS_TO_SHARE } =
      getConstants();
    const envVariables = {
      STAGE,
      STACK_NAME,
      SSM_DOC_NAME_SUFFIX,
      MAIN_ACCOUNT_BUS_ARN_NAME,
      AMI_IDS_TO_SHARE
    };

    const apiLambda = new Function(this, 'apiLambda', {
      code: Code.fromAsset(join(__dirname, '../build/backendAPI')),
      handler: 'backendAPILambda.handler',
      runtime: Runtime.NODEJS_14_X,
      environment: envVariables
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
}
