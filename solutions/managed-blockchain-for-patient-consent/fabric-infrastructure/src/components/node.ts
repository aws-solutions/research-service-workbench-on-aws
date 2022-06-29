/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as managedblockchain from 'aws-cdk-lib/aws-managedblockchain';
import * as customresources from 'aws-cdk-lib/custom-resources';
import * as constructs from 'constructs';

import * as network from './network';
import * as utilities from './utilities';

/**
 * Supported instance types for Managed Blockchain nodes
 */
export enum InstanceType {
  BURSTABLE3_SMALL = 'bc.t3.small',
  BURSTABLE3_MEDIUM = 'bc.t3.medium',
  BURSTABLE3_LARGE = 'bc.t3.large',
  BURSTABLE3_XLARGE = 'bc.t3.xlarge',
  STANDARD5_LARGE = 'bc.m5.large',
  STANDARD5_XLARGE = 'bc.m5.xlarge',
  STANDARD5_XLARGE2 = 'bc.m5.2xlarge',
  STANDARD5_XLARGE4 = 'bc.m5.4xlarge',
  COMPUTE5_LARGE = 'bc.c5.large',
  COMPUTE5_XLARGE = 'bc.c5.xlarge',
  COMPUTE5_XLARGE2 = 'bc.c5.2xlarge',
  COMPUTE5_XLARGE4 = 'bc.c5.4xlarge'
}

/**
 * Valid instance types for starter networks
 */
export const STARTER_INSTANCE_TYPES: InstanceType[] = [
  InstanceType.BURSTABLE3_SMALL,
  InstanceType.BURSTABLE3_MEDIUM
];

/**
 * Construct properties for `HyperledgerFabricNode`
 */
export interface HyperledgerFabricNodeProps {
  /**
   * The Availability Zone in which the node will be created
   * default - The first AZ in the region
   */
  readonly availabilityZone?: string;

  /**
   * The Amazon Managed Blockchain instance type for the node
   * default - BURSTABLE3_SMALL
   */
  readonly instanceType?: InstanceType;

  /**
   * The configuration to enable or disable chaincode logging
   * default - true
   */
  readonly enableChaincodeLogging?: boolean;

  /**
   * The configuration to enable or disable node logging
   * default - true
   */
  readonly enableNodeLogging?: boolean;
}

/**
 * Creates a Hyperledger Fabric node on an Amazon Managed Blockchain network
 */
export class HyperledgerFabricNode extends constructs.Construct {
  /**
   * Managed Blockchain network identifier
   */
  public readonly networkId: string;

  /**
   * Managed Blockchain member identifier
   */
  public readonly memberId: string;

  /**
   * Managed Blockchain node identifier generated on construction
   */
  public readonly nodeId: string;

  /**
   * See definition of Interface HyperledgerFabricNodeProps for descriptions of the following variables
   */
  public readonly availabilityZone: string;
  public readonly instanceType: InstanceType;
  public readonly enableChaincodeLogging: boolean;
  public readonly enableNodeLogging: boolean;

  // These cannot be readonly since they have to be set after construction
  // due the race condition documented in https://github.com/aws/aws-cdk/issues/18237.
  public endpoint: string = '';
  public eventEndpoint: string = '';

  public constructor(
    scope: network.HyperledgerFabricNetwork,
    id: string,
    props?: HyperledgerFabricNodeProps
  ) {
    super(scope, id);

    // Collect metadata on the stack
    const region = cdk.Stack.of(this).region;

    // Populate instance variables from input properties, using defaults if values not provided
    if (typeof props === 'undefined') props = {};
    this.availabilityZone = props.availabilityZone ?? `${region}a`;
    this.instanceType = props.instanceType ?? InstanceType.BURSTABLE3_SMALL;
    this.enableChaincodeLogging = props.enableChaincodeLogging ?? true;
    this.enableNodeLogging = props.enableNodeLogging ?? true;
    this.networkId = scope.networkId;
    this.memberId = scope.memberId;

    // Ensure the parameters captured above are valid, so we don't
    // need to wait until deployment time to discover an error
    utilities.validateRegion(region);
    utilities.validateAvailabilityZone(region, this.availabilityZone);
    if (
      scope.networkEdition === network.NetworkEdition.STARTER &&
      !STARTER_INSTANCE_TYPES.includes(this.instanceType)
    ) {
      const starterInstanceTypeList = STARTER_INSTANCE_TYPES.join(', ');
      throw new Error(
        `Instance type in a starter network must be one of the following: ${starterInstanceTypeList}.`
      );
    }

    // Build out the Cloudformation construct for the network/member
    const node = new managedblockchain.CfnNode(this, 'Node', {
      networkId: this.networkId,
      memberId: this.memberId,
      nodeConfiguration: {
        availabilityZone: this.availabilityZone,
        instanceType: this.instanceType
      }
    });

    // Capture data included in the Cloudformation output in instance variables
    this.nodeId = node.getAtt('NodeId').toString();
  }

  /*
   * Build out a list of HyperledgerFabricNode constructs given a list of input property
   * objects; additionally checks to ensure node count is supported given the network type
   */
  public static constructNodes(
    scope: network.HyperledgerFabricNetwork,
    nodeProps?: Array<HyperledgerFabricNodeProps>
  ): HyperledgerFabricNode[] {
    // If no node configurations are provided, create one; the empty object
    // will be populated with defaults when passed to the node constructor
    if (typeof nodeProps === 'undefined') nodeProps = [{}];
    const starter = scope.networkEdition === network.NetworkEdition.STARTER;
    if (starter && nodeProps.length > 2) {
      throw new Error('A starter network can have at most 2 nodes per member.');
    }
    if (!starter && nodeProps.length > 3) {
      throw new Error('A standard network can have at most 3 nodes per member.');
    }
    // Construct the node list, using an index value in the identifier
    return Array.from(nodeProps.entries()).map((e) => new HyperledgerFabricNode(scope, `Node${e[0]}`, e[1]));
  }

  /*
   * Configure logging for the node via SDK call; this function
   * should be merged back into the constructor once the race condition is solved
   */
  public configureLogging(sdkCallPolicy: customresources.AwsCustomResourcePolicy): void {
    // This call doesn't really need all the permissions its using in the
    // provided policy, but since the policy must be constructed all at once
    // this is the only way to do it effectively
    const logPublishingConfiguration = {
      Fabric: {
        ChaincodeLogs: {
          Cloudwatch: { Enabled: this.enableChaincodeLogging }
        },
        PeerLogs: {
          Cloudwatch: { Enabled: this.enableNodeLogging }
        }
      }
    };
    const configureNodeLogSdkCall = {
      service: 'ManagedBlockchain',
      action: 'updateNode',
      parameters: {
        NetworkId: this.networkId,
        MemberId: this.memberId,
        NodeId: this.nodeId,
        LogPublishingConfiguration: logPublishingConfiguration
      },
      physicalResourceId: customresources.PhysicalResourceId.of('Id')
    };
    // eslint-disable-next-line no-new
    new customresources.AwsCustomResource(this, 'ConfigureNodeLogResource', {
      policy: sdkCallPolicy,
      onCreate: configureNodeLogSdkCall,
      onUpdate: configureNodeLogSdkCall
    });
  }

  /*
   * Populate the output properties that must be fetched via SDK call; this function
   * should be merged back into the constructor once the race condition is solved
   */
  public fetchData(dataSdkCallPolicy: customresources.AwsCustomResourcePolicy): void {
    // This call doesn't really need all the permissions its using in the
    // provided policy, but since the policy must be constructed all at once
    // this is the only way to do it effectively
    const nodeDataSdkCall = {
      service: 'ManagedBlockchain',
      action: 'getNode',
      parameters: { NetworkId: this.networkId, MemberId: this.memberId, NodeId: this.nodeId },
      physicalResourceId: customresources.PhysicalResourceId.of('Id')
    };
    const nodeData = new customresources.AwsCustomResource(this, 'NodeDataResource', {
      policy: dataSdkCallPolicy,
      onCreate: nodeDataSdkCall,
      onUpdate: nodeDataSdkCall
    });

    // Grab items out of the above return values and stick them in output properties
    this.endpoint = nodeData.getResponseField('Node.FrameworkAttributes.Fabric.PeerEndpoint');
    this.eventEndpoint = nodeData.getResponseField('Node.FrameworkAttributes.Fabric.PeerEventEndpoint');
  }
}
