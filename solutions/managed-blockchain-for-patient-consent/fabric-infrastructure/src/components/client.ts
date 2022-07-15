/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { KeyPair } from 'cdk-ec2-key-pair';
import * as constructs from 'constructs';
import * as network from './network';

/**
 * Construct properties for `HyperledgerFabricVpc`
 */
export interface HyperledgerFabricClientProps {
  /**
   * Client VPC to create the endpoints. If not provided,
   * VPC will be created with the default properties
   * (CIDR-`10.0.0.0/16` and subnets of type `PRIVATE_ISOLATED`)
   *
   */
  readonly vpc?: ec2.IVpc;
}

/**
 * Creates a VPC and endpoint that allows Hyperledger Fabric client to
 * interact with the Hyperledger Fabric endpoints that Amazon Managed Blockchain
 * exposes for the member and network resources.
 */
export class HyperledgerFabricClient extends constructs.Construct {
  /**
   * The client VPC that has endpoint to access the Amazon Managed Blockchain
   */
  public readonly vpc: ec2.IVpc;

  /**
   * Admin Key pair to access EC2 instance
   */
  public readonly keyPair: KeyPair;

  /**
   * Admin Key pair to access EC2 instance
   */
  public readonly clienNode: ec2.Instance;

  /**
   * Managed Blockchain network VPC endpoint
   */
  public readonly vpcEndpoint: ec2.InterfaceVpcEndpoint;

  public constructor(
    scope: network.HyperledgerFabricNetwork,
    id: string,
    props?: HyperledgerFabricClientProps
  ) {
    super(scope, id);

    // Collect metadata on the stack
    const region = cdk.Stack.of(this).region;
    //
    // const topic = new sns.Topic(this, `NotifyTopic`);

    // Populate instance variables from input properties, using defaults if values not provided
    props = props ?? {};

    this.vpc =
      props.vpc ??
      new ec2.Vpc(this, 'ClientNodeVpc', {
        subnetConfiguration: [
          {
            name: `${scope.prefix}-admin-ec2-subnet`,
            subnetType: ec2.SubnetType.PUBLIC
          },
          {
            name: `${scope.prefix}-lambda-subnet`,
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED
          }
        ]
      });
    const vpcEndpointServiceName = scope.vpcEndpointServiceName.replace(`com.amazonaws.${region}.`, '');

    // Add VPC FlowLogs with the default setting of trafficType:ALL and destination:CloudWatchLogs
    this.vpc.addFlowLog('FlowLog');

    // create Security Group
    const vpcEndpointSG = new ec2.SecurityGroup(this, 'webserver-sg', {
      vpc: this.vpc,
      allowAllOutbound: true
    });

    vpcEndpointSG.addIngressRule(
      ec2.Peer.ipv4(scope.adminCidr),
      ec2.Port.tcp(22),
      'allow SSH access from Admin'
    );

    vpcEndpointSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.allTraffic(),
      'allow traffic within the VPC'
    );

    // Add a VPC endpoint to access the Managed Blockchain
    const vpcService = new ec2.InterfaceVpcEndpointService(vpcEndpointServiceName);
    this.vpcEndpoint = this.vpc.addInterfaceEndpoint('NetworkEndpoint', {
      service: vpcService,
      open: false,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSG]
    });

    // Add VPC endpoint to access Secrets Manager
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER
    });

    // Add VPC endpoint to access S3
    this.vpc.addGatewayEndpoint('S3Endpoint', { service: ec2.GatewayVpcEndpointAwsService.S3 });

    const s3PubObjectPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [`arn:aws:s3:::${scope.certS3BucketName}/*`],
          effect: iam.Effect.ALLOW
        })
      ]
    });

    // create a Role for the EC2 Instance
    const clientEC2Role = new iam.Role(this, 'client-node-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      inlinePolicies: {
        s3PubObjectPolicy
      }
    });

    this.keyPair = new KeyPair(this, 'A-Key-Pair', {
      name: 'admin-key-pair',
      description: 'Admin key pair for access client EC2 instance',
      storePublicKey: true // by default the public key will not be stored in Secrets Manager
    });

    this.clienNode = new ec2.Instance(this, 'ec2-instance', {
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      role: clientEC2Role,
      securityGroup: vpcEndpointSG,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      keyName: this.keyPair.keyPairName,
      detailedMonitoring: true
    });
  }
}
