/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
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

    // Populate instance variables from input properties, using defaults if values not provided
    props = props ?? {};
    this.vpc =
      props.vpc ??
      new ec2.Vpc(this, 'ClientVpc', {
        subnetConfiguration: [{ name: `Private`, subnetType: ec2.SubnetType.PRIVATE_ISOLATED }]
      });
    const vpcEndpointServiceName = scope.vpcEndpointServiceName.replace(`com.amazonaws.${region}.`, '');

    // Add VPC FlowLogs with the default setting of trafficType:ALL and destination:CloudWatchLogs
    this.vpc.addFlowLog('FlowLog');

    // Add a VPC endpoint to access the Managed Blockchain
    const vpcService = new ec2.InterfaceVpcEndpointService(vpcEndpointServiceName);
    this.vpcEndpoint = this.vpc.addInterfaceEndpoint('NetworkEndpoint', {
      service: vpcService,
      open: false,
      privateDnsEnabled: true
    });

    // Add VPC endpoint to access Secrets Manager
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER
    });

    // Add VPC endpoint to access S3
    this.vpc.addGatewayEndpoint('S3Endpoint', { service: ec2.GatewayVpcEndpointAwsService.S3 });
  }
}
