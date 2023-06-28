/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new */

import { join } from 'path';
import {
  WorkbenchCognito,
  WorkbenchCognitoProps,
  WorkbenchDynamodb,
  WorkbenchEncryptionKeyWithRotation
} from '@aws/workbench-core-infrastructure';

import {
  App,
  Aws,
  CfnOutput,
  CfnParameter,
  CfnResource,
  DefaultStackSynthesizer,
  Duration,
  Stack
} from 'aws-cdk-lib';
import {
  AccessLogFormat,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import {
  ApplicationTargetGroup,
  ListenerCondition,
  SslPolicy,
  TargetType
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import {
  AnyPrincipal,
  CfnPolicy,
  Effect,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Alias, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { StackProps } from 'aws-cdk-lib/core/lib/stack';
import _ from 'lodash';
import { getConstants, isSolutionsBuild } from './constants';
import Workflow from './environment/workflow';
import { RSWApplicationLoadBalancer } from './infra/RSWApplicationLoadBalancer';
import { RSWVpc } from './infra/RSWVpc';

export interface RSWStackProps extends StackProps {
  solutionId: string;
  solutionName: string;
  solutionVersion: string;
}

export class RSWStack extends Stack {
  // We extract a subset of constants required to be set on Lambda
  // Note: AWS_REGION cannot be set since it's a reserved env variable
  public lambdaEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    SSM_DOC_OUTPUT_KEY_SUFFIX: string;
    AMI_IDS_TO_SHARE: string;
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: string;
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
    S3_DATASETS_BUCKET_ARN_OUTPUT_KEY: string;
    S3_DATASETS_BUCKET_NAME: string;
    ACCT_HANDLER_ARN_OUTPUT_KEY: string;
    API_HANDLER_ARN_OUTPUT_KEY: string;
    STATUS_HANDLER_ARN_OUTPUT_KEY: string;
    STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY: string;
    SC_PORTFOLIO_NAME: string;
    ALLOWED_ORIGINS: string;
    COGNITO_DOMAIN: string;
    WEB_UI_CLIENT_ID: string;
    WEB_UI_CLIENT_SECRET: string;
    PROGRAMMATIC_ACCESS_CLIENT_ID: string;
    USER_POOL_ID: string;
    S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
    S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
    MAIN_ACCT_ALB_ARN_OUTPUT_KEY: string;
    MAIN_ACCT_ID: string;
    USER_AGENT_STRING: string;
  };

  private _accessLogsBucket: Bucket;
  private _s3AccessLogsPrefix: string;
  private _swbDomainNameOutputKey: string;
  private _mainAccountLoadBalancerListenerArnOutputKey: string;
  private _isSolutionsBuild: boolean = isSolutionsBuild();
  private _API_LIMIT: number = 200;

  public constructor(app: App, props: RSWStackProps) {
    const {
      STAGE,
      AWS_REGION,
      AWS_REGION_SHORT_NAME,
      S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY,
      S3_ACCESS_BUCKET_PREFIX,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
      S3_DATASETS_BUCKET_ARN_OUTPUT_KEY,
      LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
      STACK_NAME,
      SSM_DOC_OUTPUT_KEY_SUFFIX,
      AMI_IDS_TO_SHARE,
      ACCT_HANDLER_ARN_OUTPUT_KEY,
      API_HANDLER_ARN_OUTPUT_KEY,
      STATUS_HANDLER_ARN_OUTPUT_KEY,
      STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY,
      SC_PORTFOLIO_NAME,
      ALLOWED_ORIGINS,
      COGNITO_DOMAIN,
      USER_POOL_CLIENT_NAME,
      USER_POOL_NAME,
      WEBSITE_URLS,
      USER_POOL_ID,
      WEB_UI_CLIENT_ID,
      WEB_UI_CLIENT_SECRET,
      PROGRAMMATIC_ACCESS_CLIENT_ID,
      VPC_ID,
      S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
      S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
      MAIN_ACCT_ALB_ARN_OUTPUT_KEY,
      SWB_DOMAIN_NAME_OUTPUT_KEY,
      MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY,
      VPC_ID_OUTPUT_KEY,
      ALB_SUBNET_IDS,
      ECS_SUBNET_IDS,
      ECS_SUBNET_IDS_OUTPUT_KEY,
      ECS_SUBNET_AZS_OUTPUT_KEY,
      HOSTED_ZONE_ID,
      DOMAIN_NAME,
      ALB_INTERNET_FACING,
      FIELDS_TO_MASK_WHEN_AUDITING,
      USER_AGENT_STRING
      // In solutions pipeline build, resolve region and account to token value to be resolved on CF deployment
    } = getConstants(isSolutionsBuild() ? Aws.REGION : undefined);

    const stackProps: RSWStackProps = {
      description: `(${props.solutionId}) - ${props.solutionName} Deployment. Version: ${props.solutionVersion}`,
      env: {
        account: isSolutionsBuild() ? Aws.ACCOUNT_ID : process.env.CDK_DEFAULT_ACCOUNT,
        region: AWS_REGION
      },
      synthesizer: new DefaultStackSynthesizer({
        generateBootstrapVersionRule: isSolutionsBuild() ? false : true
      }),
      ...props
    };

    super(app, STACK_NAME, stackProps);

    if (this._isSolutionsBuild) {
      new CfnParameter(this, 'RequiredStackName', {
        type: 'String',
        default: STACK_NAME,
        description:
          'Please copy the following value into the "Stack name" field at the top of this page. Warning: Do not change this value.'
      });
    }

    const cognitoDomainToUse = this._isSolutionsBuild
      ? new CfnParameter(this, 'CognitoDomainPrefix', {
          type: 'String',
          minLength: 1,
          maxLength: 63,
          description:
            'Please provide a string for your Cognito domain name prefix. Cognito domain names must be globally unique, so be creative.'
        }).valueAsString
      : COGNITO_DOMAIN;

    const workbenchCognito = this._createCognitoResources(
      cognitoDomainToUse,
      WEBSITE_URLS,
      USER_POOL_NAME,
      USER_POOL_CLIENT_NAME
    );

    let cognitoDomain: string;
    let webUiClientId: string;
    let webUiClientSecret: string;
    let programmaticAccessClientId: string;
    let userPoolId: string;
    if (process.env.LOCAL_DEVELOPMENT === 'true') {
      cognitoDomain = `https://${COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com`;
      webUiClientId = WEB_UI_CLIENT_ID;
      webUiClientSecret = WEB_UI_CLIENT_SECRET;
      programmaticAccessClientId = PROGRAMMATIC_ACCESS_CLIENT_ID;
      userPoolId = USER_POOL_ID;
    } else {
      cognitoDomain = workbenchCognito.cognitoDomain;
      webUiClientId = workbenchCognito.webUiUserPoolClientId;
      webUiClientSecret = workbenchCognito.webUiUserPoolClientSecret.unsafeUnwrap();
      programmaticAccessClientId = workbenchCognito.programmaticAccessUserPoolClientId;
      userPoolId = workbenchCognito.userPoolId;
    }

    // We extract a subset of constants required to be set on Lambda
    // Note: AWS_REGION cannot be set since it's a reserved env variable
    const MAIN_ACCT_ID = `${this.account}`;

    this._createInitialOutputs(MAIN_ACCT_ID, AWS_REGION, AWS_REGION_SHORT_NAME);
    this._s3AccessLogsPrefix = S3_ACCESS_BUCKET_PREFIX;
    this._swbDomainNameOutputKey = SWB_DOMAIN_NAME_OUTPUT_KEY;
    this._mainAccountLoadBalancerListenerArnOutputKey = MAIN_ACCT_ALB_LISTENER_ARN_OUTPUT_KEY;
    this._accessLogsBucket = this._createAccessLogsBucket(S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY);

    const S3DatasetsEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY);
    const datasetBucket = this._createS3DatasetsBuckets(
      S3_DATASETS_BUCKET_ARN_OUTPUT_KEY,
      S3DatasetsEncryptionKey.key
    );

    this.lambdaEnvVars = {
      STAGE,
      STACK_NAME,
      SSM_DOC_OUTPUT_KEY_SUFFIX,
      AMI_IDS_TO_SHARE,
      LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
      S3_DATASETS_BUCKET_ARN_OUTPUT_KEY,
      S3_DATASETS_BUCKET_NAME: datasetBucket.bucketName,
      ACCT_HANDLER_ARN_OUTPUT_KEY,
      API_HANDLER_ARN_OUTPUT_KEY,
      STATUS_HANDLER_ARN_OUTPUT_KEY,
      STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY,
      SC_PORTFOLIO_NAME,
      ALLOWED_ORIGINS,
      COGNITO_DOMAIN: cognitoDomain,
      WEB_UI_CLIENT_ID: webUiClientId,
      WEB_UI_CLIENT_SECRET: webUiClientSecret,
      PROGRAMMATIC_ACCESS_CLIENT_ID: programmaticAccessClientId,
      USER_POOL_ID: userPoolId,
      S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
      S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY,
      MAIN_ACCT_ALB_ARN_OUTPUT_KEY,
      MAIN_ACCT_ID,
      USER_AGENT_STRING
    };

    const S3ArtifactEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY);
    const artifactS3Bucket = this._createS3ArtifactsBuckets(
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
      S3ArtifactEncryptionKey.key
    );
    const lcRole = this._createLaunchConstraintIAMRole(LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY, artifactS3Bucket);
    const createAccountHandler = this._createAccountHandlerLambda(lcRole, artifactS3Bucket, AMI_IDS_TO_SHARE);
    const statusHandler = this._createStatusHandlerLambda(datasetBucket);
    const apiLambda: Function = this._createAPILambda(
      datasetBucket,
      artifactS3Bucket,
      FIELDS_TO_MASK_WHEN_AUDITING,
      S3DatasetsEncryptionKey.key,
      S3ArtifactEncryptionKey.key
    );

    // Application DynamoDB Encryption Key
    const applicationDDBTableEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, `${this.stackName}-applicationDDBTableEncryptionKey`);

    // Create Application DynamoDB Table
    this._createApplicationDDBTable(
      applicationDDBTableEncryptionKey.key,
      apiLambda,
      statusHandler,
      createAccountHandler
    );

    // DynamicAuth DynamoDB Encryption Key
    const dynamicAuthDynamodbEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, `${this.stackName}-dynamicAuthDynamodbEncryptionKey`);

    // Create DynamicAuth DynamoDB Table
    const dynamicAuthTable = this._createDynamicAuthDDBTable(
      dynamicAuthDynamodbEncryptionKey.key,
      apiLambda,
      statusHandler,
      createAccountHandler
    );

    const revokedTokensDDBTableEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, `${this.stackName}-revokedTokensDDBTableEncryptionKey`);
    const revokedTokensDDBTable = this._createRevokedTokensDDBTable(
      revokedTokensDDBTableEncryptionKey.key,
      apiLambda,
      statusHandler,
      createAccountHandler
    );

    // Add DynamicAuth DynamoDB Table name to lambda environment variable
    _.map([apiLambda, statusHandler, createAccountHandler], (lambda) => {
      lambda.addEnvironment('DYNAMIC_AUTH_DDB_TABLE_NAME', dynamicAuthTable.tableName);
    });

    _.map([apiLambda, statusHandler, createAccountHandler], (lambda) => {
      lambda.addEnvironment('REVOKED_TOKENS_DDB_TABLE_NAME', revokedTokensDDBTable.tableName);
    });

    const apiGwUrl = this._createRestApi(apiLambda);

    [apiLambda, statusHandler, createAccountHandler].forEach((lambda) => {
      if (
        !_.isUndefined(lambda.node.findChild('ServiceRole').node.tryFindChild('DefaultPolicy')) &&
        !_.isUndefined(lambda.node.findChild('ServiceRole').node.findChild('DefaultPolicy').node.defaultChild)
      ) {
        const cfnPolicy = lambda.node.findChild('ServiceRole').node.findChild('DefaultPolicy').node
          .defaultChild as CfnPolicy;
        cfnPolicy.addMetadata('cfn_nag', {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          rules_to_suppress: [
            {
              id: 'W76',
              reason:
                'Reviewed the autogenerated default policy. SPCM complexity greater then 25 is appropriate for this policy'
            }
          ]
        });
      }
    });

    const metadatanode = this.node.findChild('AWS679f53fac002430cb0da5b7982bd2287').node
      .defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason:
            "Lambda created by using AWSCustomResource and is managed by CDK internals. We don't want to jeopardize it's functionality"
        },
        {
          id: 'W89',
          reason:
            "Lambda created by using AWSCustomResource and is managed by CDK internals. We don't want to jeopardize it's functionality"
        },
        {
          id: 'W92',
          reason:
            "Lambda created by using AWSCustomResource and is managed by CDK internals. We don't want to jeopardize it's functionality"
        }
      ]
    });

    const workflow = new Workflow(this);
    workflow.createSSMDocuments();

    const rswVpc = this._createVpc(VPC_ID, ALB_SUBNET_IDS, ECS_SUBNET_IDS);
    new CfnOutput(this, VPC_ID_OUTPUT_KEY, {
      value: rswVpc.vpc.vpcId
    });

    let childMetadataNode = rswVpc.node.findChild('VpcFlowLogGroup').node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W84',
          reason: 'TODO: CloudWatchLogs LogGroup should specify a KMS Key Id to encrypt the log data'
        }
      ]
    });

    if (
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.tryFindChild('PublicSubnet1')) &&
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet1').node.defaultChild)
    ) {
      childMetadataNode = rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet1').node
        .defaultChild as CfnResource;
      childMetadataNode.addMetadata('cfn_nag', {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rules_to_suppress: [
          {
            id: 'W33',
            reason: 'TODO: EC2 Subnet should not have MapPublicIpOnLaunch set to true'
          }
        ]
      });
    }

    if (
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.tryFindChild('PublicSubnet2')) &&
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet2').node.defaultChild)
    ) {
      childMetadataNode = rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet2').node
        .defaultChild as CfnResource;
      childMetadataNode.addMetadata('cfn_nag', {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rules_to_suppress: [
          {
            id: 'W33',
            reason: 'TODO: EC2 Subnet should not have MapPublicIpOnLaunch set to true'
          }
        ]
      });
    }

    if (
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.tryFindChild('PublicSubnet3')) &&
      !_.isUndefined(rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet3').node.defaultChild)
    ) {
      childMetadataNode = rswVpc.node.findChild('MainVPC').node.findChild('PublicSubnet3').node
        .defaultChild as CfnResource;
      childMetadataNode.addMetadata('cfn_nag', {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rules_to_suppress: [
          {
            id: 'W33',
            reason: 'TODO: EC2 Subnet should not have MapPublicIpOnLaunch set to true'
          }
        ]
      });
    }

    new CfnOutput(this, ECS_SUBNET_IDS_OUTPUT_KEY, {
      value: (rswVpc.ecsSubnetSelection.subnets?.map((subnet) => subnet.subnetId) ?? []).join(',')
    });

    new CfnOutput(this, ECS_SUBNET_AZS_OUTPUT_KEY, {
      value: (rswVpc.vpc.availabilityZones?.map((az) => az) ?? []).join(',')
    });

    const hostedZoneId = this._isSolutionsBuild
      ? new CfnParameter(this, 'HostedZoneId', {
          type: 'String',
          default: HOSTED_ZONE_ID,
          description: 'The Route 53 Hosted Zone ID linked to your custom domain name.'
        }).valueAsString
      : HOSTED_ZONE_ID;

    const domainName = this._isSolutionsBuild
      ? new CfnParameter(this, 'DomainName', {
          type: 'String',
          default: DOMAIN_NAME,
          description:
            'A custom domain name that you own. TLS certificates will be generated at the time of application deployment.'
        }).valueAsString
      : DOMAIN_NAME;

    this._createLoadBalancer(
      rswVpc,
      apiGwUrl,
      domainName,
      hostedZoneId,
      ALB_INTERNET_FACING,
      this._accessLogsBucket
    );
  }

  private _createVpc(vpcId: string, albSubnetIds: string[], ecsSubnetIds: string[]): RSWVpc {
    const rswVpc = new RSWVpc(this, 'RSWVpc', {
      vpcId,
      albSubnetIds,
      ecsSubnetIds
    });

    return rswVpc;
  }

  private _createLoadBalancer(
    rswVpc: RSWVpc,
    apiGwUrl: string,
    domainName: string,
    hostedZoneId: string,
    internetFacing: boolean,
    accessLogsBucket: Bucket
  ): void {
    const alb = new RSWApplicationLoadBalancer(this, 'RSWApplicationLoadBalancer', {
      vpc: rswVpc.vpc,
      subnets: rswVpc.albSubnetSelection,
      internetFacing,
      accessLogsBucket
    });

    const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName: domainName,
      hostedZoneId: hostedZoneId
    });

    // Add a Route 53 alias with the Load Balancer as the target
    new ARecord(this, 'AliasRecord', {
      zone,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(alb.applicationLoadBalancer))
    });

    const proxyLambda = new Function(this, 'LambdaProxy', {
      handler: 'proxyHandlerLambda.handler',
      code: Code.fromAsset(join(__dirname, '../../build/proxyHandler')),
      runtime: Runtime.NODEJS_18_X,
      reservedConcurrentExecutions: this._API_LIMIT,
      environment: { ...this.lambdaEnvVars, API_GW_URL: apiGwUrl },
      timeout: Duration.seconds(60),
      memorySize: 256
    });

    const childMetadataNode = proxyLambda.node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason: 'TODO: Lambda functions require permission to write CloudWatch Logs'
        },
        {
          id: 'W89',
          reason: 'TODO: Lambda functions should be deployed inside a VPC'
        },
        {
          id: 'W92',
          reason:
            'TODO: Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions'
        }
      ]
    });

    new Alias(this, 'LiveProxyLambdaAlias', {
      aliasName: 'live',
      version: proxyLambda.currentVersion,
      provisionedConcurrentExecutions: 1
    });

    // Add a listener on port 443 for and use the certificate for HTTPS
    const certificate = new Certificate(this, 'SWBCertificate', {
      domainName: domainName,
      validation: CertificateValidation.fromDns(zone)
    });
    const httpsListener = alb.applicationLoadBalancer.addListener('HTTPSListener', {
      port: 443,
      certificates: [certificate],
      sslPolicy: SslPolicy.RECOMMENDED_TLS
    });

    const targetGroup = new ApplicationTargetGroup(this, 'proxyLambdaTargetGroup', {
      targetType: TargetType.LAMBDA,
      targets: [new LambdaTarget(proxyLambda)]
    });

    targetGroup.setAttribute('lambda.multi_value_headers.enabled', 'true');

    httpsListener.addTargetGroups('addProxyLambdaTargetGroup', {
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/api/*'])],
      targetGroups: [targetGroup]
    });

    httpsListener.addTargetGroups('addDefaultTargetGroup', {
      targetGroups: [targetGroup]
    });

    new CfnOutput(this, this.lambdaEnvVars.MAIN_ACCT_ALB_ARN_OUTPUT_KEY, {
      value: alb.applicationLoadBalancer.loadBalancerArn
    });

    new CfnOutput(this, this._swbDomainNameOutputKey, {
      value: domainName
    });

    new CfnOutput(this, this._mainAccountLoadBalancerListenerArnOutputKey, {
      value: alb.applicationLoadBalancer.listeners[0].listenerArn
    });

    new CfnOutput(this, 'apiUrlOutput', {
      value: `https://${domainName}/api/`
    });
  }

  private _createInitialOutputs(accountId: string, awsRegion: string, awsRegionName: string): void {
    new CfnOutput(this, 'accountId', {
      value: accountId
    });
    new CfnOutput(this, 'awsRegion', {
      value: awsRegion
    });
    new CfnOutput(this, 'awsRegionShortName', {
      value: awsRegionName
    });
  }

  private _createLaunchConstraintIAMRole(
    launchConstraintRoleNameOutput: string,
    artifactS3Bucket: Bucket
  ): Role {
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
          resources: ['*'] // Needed to update SC Product. Must be wildcard to cover all possible templates the product can deploy in different accounts, which we don't know at time of creation
        }),
        new PolicyStatement({
          actions: ['s3:GetObject', 's3:GetObjectVersion'],
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
          resources: ['*'] // DescribeTags, DescrbeKeyPairs, DescribeSecurityGroups, DescribeSubnets, DescribeVpcs do not allow for resource-based permissions
        }),
        new PolicyStatement({
          actions: ['kms:CreateGrant'],
          resources: ['*'] // Must be wildcard because we do not know the keys at the time of creation of this policy
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
            'arn:aws:sagemaker:*:*:notebook-instance-lifecycle-config/?asic?otebook?nstance?ifecycle?onfig-*'
          ]
        }),
        new PolicyStatement({
          actions: [
            'sagemaker:DescribeNotebookInstance',
            'sagemaker:CreateNotebookInstance',
            'sagemaker:AddTags',
            'sagemaker:StopNotebookInstance',
            'sagemaker:StopNotebookInstance',
            'sagemaker:DeleteNotebookInstance'
          ],
          resources: ['arn:aws:sagemaker:*:*:notebook-instance/?asic?otebook?nstance-*']
        }),
        new PolicyStatement({
          actions: ['s3:GetObject', 's3:GetObjectVersion'],
          resources: [`${artifactS3Bucket.bucketArn}/*`]
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
          resources: ['*'] // DescribeNetworkInterfaces does not allow resource-level permissions
        })
      ]
    });

    const iamRole = new Role(this, 'LaunchConstraint', {
      assumedBy: new ServicePrincipal('servicecatalog.amazonaws.com'),
      description: 'Launch constraint role for Service Catalog products',
      inlinePolicies: {
        sagemakerNotebookLaunchPermissions: sagemakerNotebookPolicy,
        commonScManagement
      }
    });

    new CfnOutput(this, launchConstraintRoleNameOutput, {
      value: iamRole.roleName
    });

    const metadatanode = iamRole.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W28',
          reason:
            'TODO:triage Resource found with an explicit name, this disallows updates that require replacement of this resource'
        },
        {
          id: 'W11',
          reason: 'TODO:triage IAM role should not allow * resource on its permissions policy'
        }
      ]
    });

    return iamRole;
  }

  /**
   * Create bucket for S3 access logs.
   * Note this bucket does not have sigv4/https policies because these restrict access log delivery.
   * Note this bucket uses S3 Managed encryption as a requirement for access logging.
   * @param bucketNameOutput - Name of Access Logs Bucket.
   * @returns S3Bucket
   */
  private _createAccessLogsBucket(bucketNameOutput: string): Bucket {
    const s3Bucket = new Bucket(this, 's3-access-logs', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });

    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${s3Bucket.bucketArn}/${this._s3AccessLogsPrefix}*`],
        conditions: {
          StringEquals: {
            'aws:SourceAccount': this._isSolutionsBuild ? Aws.ACCOUNT_ID : process.env.CDK_DEFAULT_ACCOUNT
          }
        }
      })
    );

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

    new CfnOutput(this, bucketNameOutput, {
      value: s3Bucket.bucketName,
      exportName: bucketNameOutput
    });

    const metadatanode = s3Bucket.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W35',
          reason: 'TODO:triage S3 Bucket should have access logging configured'
        }
      ]
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

    const metadatanode = s3Bucket.policy?.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'F15',
          reason: 'TODO:triage S3 Bucket policy should not allow * action'
        },
        {
          id: 'F16',
          reason: 'TODO:triage S3 Bucket policy should not allow * principal'
        }
      ]
    });
  }

  private _createS3ArtifactsBuckets(s3ArtifactName: string, s3ArtifactsEncryptionKey: Key): Bucket {
    return this._createSecureS3Bucket('s3-artifacts', s3ArtifactName, s3ArtifactsEncryptionKey);
  }

  private _createS3DatasetsBuckets(s3DatasetsName: string, s3DatasetsEncryptionKey: Key): Bucket {
    const bucket: Bucket = this._createSecureS3Bucket('s3-datasets', s3DatasetsName, s3DatasetsEncryptionKey);
    this._addAccessPointDelegationStatement(bucket);

    const metadatanode = bucket.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W35',
          reason: 'TODO:triage S3 Bucket should have access logging configured'
        }
      ]
    });
    new CfnOutput(this, 'DataSetsBucketName', {
      value: bucket.bucketName
    });
    return bucket;
  }

  private _createSecureS3Bucket(s3BucketId: string, s3OutputId: string, encryptionKey: Key): Bucket {
    const s3Bucket = new Bucket(this, s3BucketId, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsBucket: this._accessLogsBucket,
      serverAccessLogsPrefix: this._s3AccessLogsPrefix,
      encryption: BucketEncryption.KMS,
      encryptionKey: encryptionKey,
      versioned: true,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });
    this._addS3TLSSigV4BucketPolicy(s3Bucket);

    new CfnOutput(this, s3OutputId, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }

  private _createStatusHandlerLambda(datasetBucket: Bucket): Function {
    const statusHandlerLambda = new Function(this, 'statusHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/statusHandler')),
      handler: 'statusHandlerLambda.handler',
      runtime: Runtime.NODEJS_18_X,
      reservedConcurrentExecutions: 100,
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
              's3:GetObjectVersionTagging',
              's3:AbortMultipartUpload',
              's3:ListMultipartUploadParts',
              's3:PutObject',
              's3:PutObjectAcl',
              's3:PutObjectVersionAcl',
              's3:PutObjectTagging',
              's3:PutObjectVersionTagging',
              's3:ListBucket',
              's3:ListBucketVersions',
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

    const metadatanode = statusHandlerLambda.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason:
            'TODO:triage (statusHandlerLambda) Lambda functions require permission to write CloudWatch Logs'
        },
        {
          id: 'W89',
          reason: 'TODO:triage (statusHandlerLambda) Lambda functions should be deployed inside a VPC'
        },
        {
          id: 'W92',
          reason:
            'TODO:triage (statusHandlerLambda) Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions'
        }
      ]
    });

    return statusHandlerLambda;
  }

  private _createAccountHandlerLambda(
    launchConstraintRole: Role,
    artifactS3Bucket: Bucket,
    amiIdsToShare: string
  ): Function {
    const lambda = new Function(this, 'accountHandlerLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/accountHandler')),
      handler: 'accountHandlerLambda.handler',
      runtime: Runtime.NODEJS_18_X,
      reservedConcurrentExecutions: 1,
      environment: this.lambdaEnvVars,
      memorySize: 256,
      timeout: Duration.minutes(4)
    });

    const amiIdsList: string[] = JSON.parse(amiIdsToShare);

    const lambdaPolicy = new Policy(this, 'accountHandlerPolicy', {
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
          sid: 'SearchProductsAsAdmin',
          actions: ['servicecatalog:SearchProductsAsAdmin'],
          resources: [`arn:aws:catalog:${this.region}:${this.account}:portfolio/*`]
        }),
        new PolicyStatement({
          sid: 'ListProvisioningArtifacts',
          actions: ['servicecatalog:ListProvisioningArtifacts'],
          resources: [`arn:aws:catalog:${this.region}:${this.account}:product/*`]
        }),
        new PolicyStatement({
          sid: 'DescribeProvisioningArtifact',
          actions: ['servicecatalog:DescribeProvisioningArtifact'],
          resources: [`arn:aws:catalog:${this.region}:${this.account}:product/*`]
        }),
        new PolicyStatement({
          sid: 'GetObject',
          actions: ['s3:GetObject', 's3:GetObjectVersion'],
          resources: [`arn:aws:s3:::${this.lambdaEnvVars.STACK_NAME}*`]
        }),
        new PolicyStatement({
          actions: ['kms:Decrypt', 'kms:GenerateDataKey', 'kms:GetKeyPolicy', 'kms:PutKeyPolicy'],
          resources: [`arn:aws:kms:${this.region}:${this.account}:key/*`],
          sid: 'KMSAccess'
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
          actions: ['s3:GetObject', 's3:GetObjectVersion'],
          resources: [`${artifactS3Bucket.bucketArn}/*`]
        })
      ]
    });

    const lambdaPolicyMetaDataNode = lambdaPolicy.node.defaultChild as CfnResource;
    lambdaPolicyMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W76',
          reason: 'TODO:triage (AccountHandlerLambdaPolicy) SPCM for IAM policy document is higher than 25'
        }
      ]
    });

    if (!_.isEmpty(amiIdsList)) {
      lambdaPolicy.addStatements(
        new PolicyStatement({
          sid: 'ShareAmi',
          actions: ['ec2:ModifyImageAttribute'],
          resources: amiIdsList
        })
      );
    }

    lambda.role?.attachInlinePolicy(lambdaPolicy);

    new CfnOutput(this, 'AccountHandlerLambdaRoleOutput', {
      value: lambda.role!.roleArn
    });

    // Run lambda function every 5 minutes
    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '0/5' })
    });
    eventRule.addTarget(new targets.LambdaFunction(lambda));

    const lambdaMetadataNode = lambda.node.defaultChild as CfnResource;
    lambdaMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason:
            'TODO:triage (AccountHandlerLambda) Lambda functions require permission to write CloudWatch Logs'
        },
        {
          id: 'W89',
          reason: 'TODO:triage (AccountHandlerLambda) Lambda functions should be deployed inside a VPC'
        },
        {
          id: 'W92',
          reason:
            'TODO:triage (AccountHandlerLambda) Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions'
        }
      ]
    });

    return lambda;
  }

  private _createAPILambda(
    datasetBucket: Bucket,
    artifactS3Bucket: Bucket,
    fieldsToMaskWhenAuditing: string[],
    datasetsEncryptionKey: Key,
    artifactEncryptionKey: Key
  ): Function {
    const apiLambda = new Function(this, 'apiLambda', {
      code: Code.fromAsset(join(__dirname, '../../build/backendAPI')),
      handler: 'backendAPILambda.handler',
      runtime: Runtime.NODEJS_18_X,
      reservedConcurrentExecutions: this._API_LIMIT,
      environment: {
        ...this.lambdaEnvVars,
        FIELDS_TO_MASK_WHEN_AUDITING: JSON.stringify(fieldsToMaskWhenAuditing)
      },
      timeout: Duration.seconds(29), // Integration timeout should be 29 seconds https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
      memorySize: 832
    });
    apiLambda.role?.attachInlinePolicy(
      new Policy(this, 'apiLambdaPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['events:DescribeRule', 'events:Put*'],
            resources: [`arn:aws:events:${this.region}:${this.account}:event-bus/default`],
            sid: 'EventBridgeAccess'
          }),
          new PolicyStatement({
            actions: ['cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents'],
            resources: [`arn:aws:cloudformation:${this.region}:*:stack/${this.stackName}*`],
            sid: 'CfnAccess'
          }),
          new PolicyStatement({
            actions: ['servicecatalog:ListLaunchPaths'],
            resources: [`arn:aws:catalog:${this.region}:*:product/*`],
            sid: 'ScAccess'
          }),
          new PolicyStatement({
            actions: ['cognito-idp:DescribeUserPoolClient'],
            resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/*`],
            sid: 'CognitoAccess'
          }),
          new PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: ['arn:aws:iam::*:role/*env-mgmt', 'arn:aws:iam::*:role/*hosting-account-role'],
            sid: 'AssumeRole'
          }),
          new PolicyStatement({
            actions: [
              'kms:GetKeyPolicy',
              'kms:PutKeyPolicy',
              'kms:GenerateDataKey',
              'kms:Decrypt',
              'kms:Encrypt',
              'kms:DescribeKey',
              'kms:ReEncrypt*'
            ],
            resources: [datasetsEncryptionKey.keyArn, artifactEncryptionKey.keyArn],
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
              's3:GetObjectVersionTagging',
              's3:AbortMultipartUpload',
              's3:ListMultipartUploadParts',
              's3:GetBucketPolicy',
              's3:PutBucketPolicy',
              's3:PutObject',
              's3:PutObjectAcl',
              's3:PutObjectVersionAcl',
              's3:PutObjectTagging',
              's3:PutObjectVersionTagging',
              's3:ListBucket',
              's3:ListBucketVersions',
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
            actions: ['s3:GetObject', 's3:GetObjectVersion', 's3:GetBucketPolicy', 's3:PutBucketPolicy'],
            resources: [artifactS3Bucket.bucketArn, `${artifactS3Bucket.bucketArn}/*`]
          }),
          new PolicyStatement({
            sid: 'cognitoAccess',
            actions: [
              'cognito-idp:AdminAddUserToGroup',
              'cognito-idp:AdminCreateUser',
              'cognito-idp:AdminDeleteUser',
              'cognito-idp:AdminGetUser',
              'cognito-idp:AdminEnableUser',
              'cognito-idp:AdminDisableUser',
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

    let childMetadataNode = apiLambda.node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W58',
          reason: 'TODO:triage (ApiLambda) Lambda functions require permission to write CloudWatch Logs'
        },
        {
          id: 'W89',
          reason: 'TODO:triage (ApiLambda) Lambda functions should be deployed inside a VPC'
        },
        {
          id: 'W92',
          reason:
            'TODO:triage (ApiLambda) Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions'
        }
      ]
    });

    childMetadataNode = this.node.findChild('apiLambdaPolicy').node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W12',
          reason: 'TODO: IAM policy should not allow * resource'
        },
        {
          id: 'W76',
          reason: 'TODO: SPCM for IAM policy document is higher than 25'
        }
      ]
    });

    return apiLambda;
  }

  // API Gateway
  private _createRestApi(apiLambda: Function): string {
    const logGroup = new LogGroup(this, 'APIGatewayAccessLogs', { retention: RetentionDays.TEN_YEARS });
    const metadatanode = logGroup.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W84', //was 68...
          reason: 'TODO:triage CloudWatchLogs LogGroup should specify a KMS Key Id to encrypt the log data'
        }
      ]
    });

    const API: RestApi = new RestApi(this, `API-Gateway API`, {
      restApiName: this.stackName,
      description: 'SWB API',
      deployOptions: {
        stageName: 'dev',
        accessLogDestination: new LogGroupLogDestination(logGroup),
        throttlingRateLimit: this._API_LIMIT,
        throttlingBurstLimit: this._API_LIMIT,
        accessLogFormat: AccessLogFormat.custom(
          JSON.stringify({
            stage: '$context.stage',
            requestTime: '$context.requestTime',
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
        allowOrigins: JSON.parse(this.lambdaEnvVars.ALLOWED_ORIGINS || '[]')
      }
    });

    let childMetadataNode = API.node.findChild('DeploymentStage.dev').node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W64',
          reason: 'TODO:triage resources should be associated with an AWS::ApiGateway::UsagePlan.'
        },
        {
          id: 'W59',
          reason: 'AuthN with Congnito + JWT and AuthZ with CASL is implemented.'
        }
      ]
    });

    childMetadataNode = API.node.findChild('Deployment').node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W68',
          reason: 'TODO: Enable on Usage plan for API Gateway'
        }
      ]
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

    childMetadataNode = API.node.findChild('Default').node.findChild('ANY').node.defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W59',
          reason:
            "TODO:triage should not have AuthorizationType set to 'NONE' unless it is of HttpMethod: OPTIONS.."
        }
      ]
    });

    childMetadataNode = API.node.findChild('Default').node.findChild('{proxy+}').node.findChild('ANY').node
      .defaultChild as CfnResource;
    childMetadataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W59',
          reason:
            "TODO:triage should not have AuthorizationType set to 'NONE' unless it is of HttpMethod: OPTIONS.."
        }
      ]
    });

    return API.url;
  }

  //DynamicAuth DynamoDB Table
  // Create DynamicAuthDDBTable
  private _createDynamicAuthDDBTable(
    encryptionKey: Key,
    apiLambda: Function,
    statusHandler: Function,
    createAccountHandler: Function
  ): Table {
    const dynamicAuthDDBTable = new WorkbenchDynamodb(this, `${this.stackName}-dynamic-auth`, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      encryptionKey: encryptionKey,
      lambdas: [apiLambda, statusHandler, createAccountHandler],
      gsis: [
        {
          indexName: 'getIdentityPermissionsByIdentity',
          partitionKey: { name: 'identity', type: AttributeType.STRING },
          sortKey: { name: 'pk', type: AttributeType.STRING }
        }
      ],
      timeToLiveAttribute: 'expirationTime'
    });

    new CfnOutput(this, 'dynamicAuthDDBTableArn', {
      value: dynamicAuthDDBTable.table.tableArn
    });

    new CfnOutput(this, 'dynamicAuthDDBTableName', {
      value: dynamicAuthDDBTable.table.tableName
    });

    return dynamicAuthDDBTable.table;
  }

  private _createRevokedTokensDDBTable(
    encryptionKey: Key,
    apiLambda: Function,
    statusHandler: Function,
    createAccountHandler: Function
  ): Table {
    const revokedTokensDDBTable = new WorkbenchDynamodb(this, `${this.stackName}-revoked-tokens`, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      encryptionKey: encryptionKey,
      lambdas: [apiLambda, statusHandler, createAccountHandler],
      timeToLiveAttribute: 'ttl'
    });

    new CfnOutput(this, 'revokedTokensDDBTableArn', {
      value: revokedTokensDDBTable.table.tableArn
    });

    new CfnOutput(this, 'revokedTokensDDBTableName', {
      value: revokedTokensDDBTable.table.tableName
    });

    return revokedTokensDDBTable.table;
  }

  // Application DynamoDB Table
  private _createApplicationDDBTable(
    encryptionKey: Key,
    apiLambda: Function,
    statusHandler: Function,
    createAccountHandler: Function
  ): Table {
    const tableName: string = `${this.stackName}`;
    const table = new Table(this, tableName, {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      tableName: tableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: encryptionKey
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

    const metadatanode = table.node.defaultChild as CfnResource;
    metadatanode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'W28',
          reason:
            'TODO:triage Resource found with an explicit name, this disallows updates that require replacement of this resource'
        },
        {
          id: 'W74',
          reason: 'TODO:triage DynamoDB table should have encryption enabled using a CMK stored in KMS'
        },
        {
          id: 'W78',
          reason:
            'TODO:triage DynamoDB table should have backup enabled, should be set using PointInTimeRecoveryEnabled'
        }
      ]
    });

    return table;
  }

  private _createCognitoResources(
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
        accessTokenValidity: Duration.minutes(15)
      },
      programmaticAccessUserPoolTokenValidity: {
        accessTokenValidity: Duration.minutes(60)
      }
    };

    const workbenchCognito = new WorkbenchCognito(this, 'ServiceWorkbenchCognito', props);

    new CfnOutput(this, 'cognitoUserPoolId', {
      value: workbenchCognito.userPoolId
    });

    new CfnOutput(this, 'cognitoWebUiUserPoolClientId', {
      value: workbenchCognito.webUiUserPoolClientId
    });

    new CfnOutput(this, 'cognitoProgrammaticAccessUserPoolClientId', {
      value: workbenchCognito.programmaticAccessUserPoolClientId
    });

    new CfnOutput(this, 'cognitoDomainName', {
      value: workbenchCognito.cognitoDomain
    });

    return workbenchCognito;
  }
}
