/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';

import * as hyperledger from '../components';

const DEFAULT_ENV = { env: { region: 'us-east-1' } };

const TOKEN_REGEXP = /^\$\{Token\[TOKEN\.[0-9]+\]\}$/;

describe('HyperledgerFabricNode', () => {
  test('Create a network with the default node configuration', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember'
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 1);
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1a',
          InstanceType: 'bc.t3.small'
        }
      }
    });
    expect(network.nodes).toHaveLength(1);
    expect(network.nodes[0].availabilityZone).toBe('us-east-1a');
    expect(network.nodes[0].instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_SMALL);
    expect(network.nodes[0].nodeId).toMatch(TOKEN_REGEXP);
    expect(network.nodes[0].endpoint).toMatch(TOKEN_REGEXP);
    expect(network.nodes[0].eventEndpoint).toMatch(TOKEN_REGEXP);
    expect(network.nodes[0].enableNodeLogging).toBe(true);
    expect(network.nodes[0].enableChaincodeLogging).toBe(true);
  });

  test('Create a network without any nodes', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: []
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 0);
    expect(network.nodes).toHaveLength(0);
  });

  test('Create a node separate from a network', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: []
    });
    const node = new hyperledger.HyperledgerFabricNode(network, 'TestHyperledgerFabricNode');
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 1);
    expect(network.nodes).toHaveLength(0);
    expect(node.availabilityZone).toBe('us-east-1a');
    expect(node.instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_SMALL);
  });

  test('Create a network with custom nodes', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: [
        {
          availabilityZone: 'us-east-1b',
          instanceType: hyperledger.InstanceType.BURSTABLE3_MEDIUM
        },
        {
          availabilityZone: 'us-east-1c',
          instanceType: hyperledger.InstanceType.STANDARD5_LARGE
        },
        {
          availabilityZone: 'us-east-1d',
          instanceType: hyperledger.InstanceType.COMPUTE5_XLARGE
        }
      ]
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 3);
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1b',
          InstanceType: 'bc.t3.medium'
        }
      }
    });
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1c',
          InstanceType: 'bc.m5.large'
        }
      }
    });
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1d',
          InstanceType: 'bc.c5.xlarge'
        }
      }
    });
    expect(network.nodes).toHaveLength(3);
    expect(network.nodes[0].availabilityZone).toBe('us-east-1b');
    expect(network.nodes[0].instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_MEDIUM);
    expect(network.nodes[1].availabilityZone).toBe('us-east-1c');
    expect(network.nodes[1].instanceType).toBe(hyperledger.InstanceType.STANDARD5_LARGE);
    expect(network.nodes[2].availabilityZone).toBe('us-east-1d');
    expect(network.nodes[2].instanceType).toBe(hyperledger.InstanceType.COMPUTE5_XLARGE);
  });

  test('Create a starter network with the default node configuration', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      networkEdition: hyperledger.NetworkEdition.STARTER
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 1);
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1a',
          InstanceType: 'bc.t3.small'
        }
      }
    });
    expect(network.nodes).toHaveLength(1);
    expect(network.nodes[0].availabilityZone).toBe('us-east-1a');
    expect(network.nodes[0].instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_SMALL);
    expect(network.nodes[0].nodeId).toMatch(TOKEN_REGEXP);
    expect(network.nodes[0].endpoint).toMatch(TOKEN_REGEXP);
    expect(network.nodes[0].eventEndpoint).toMatch(TOKEN_REGEXP);
  });

  test('Create a starter network with custom node configuration', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      networkEdition: hyperledger.NetworkEdition.STARTER,
      nodes: [
        {
          availabilityZone: 'us-east-1b',
          instanceType: hyperledger.InstanceType.BURSTABLE3_SMALL
        },
        {
          availabilityZone: 'us-east-1c',
          instanceType: hyperledger.InstanceType.BURSTABLE3_MEDIUM
        }
      ]
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 2);
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1b',
          InstanceType: 'bc.t3.small'
        }
      }
    });
    template.hasResource('AWS::ManagedBlockchain::Node', {
      Properties: {
        NodeConfiguration: {
          AvailabilityZone: 'us-east-1c',
          InstanceType: 'bc.t3.medium'
        }
      }
    });
    expect(network.nodes).toHaveLength(2);
    expect(network.nodes[0].availabilityZone).toBe('us-east-1b');
    expect(network.nodes[0].instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_SMALL);
    expect(network.nodes[1].availabilityZone).toBe('us-east-1c');
    expect(network.nodes[1].instanceType).toBe(hyperledger.InstanceType.BURSTABLE3_MEDIUM);
  });

  test('Fail to create a network with an invalid node availability zone', () => {
    expect(hyperledger.SUPPORTED_AVAILABILITY_ZONES).not.toContain('us-west-1a');
    const mismatchedAvailabilityZone = () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        nodes: [
          {
            availabilityZone: 'us-west-1a'
          }
        ]
      });
    };
    expect(hyperledger.SUPPORTED_AVAILABILITY_ZONES['us-east-1']).not.toContain('us-east-1z');
    const nonexistantAvailabilityZone = () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        nodes: [
          {
            availabilityZone: 'us-east-1z'
          }
        ]
      });
    };
    expect(mismatchedAvailabilityZone).toThrow(Error);
    expect(nonexistantAvailabilityZone).toThrow(Error);
  });

  test('Fail to create a network with too many nodes', () => {
    const unsupportedInstanceType = () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        nodes: [{}, {}, {}, {}]
      });
    };
    expect(unsupportedInstanceType).toThrow(Error);
  });

  test('Fail to create a starter network with too many nodes', () => {
    const unsupportedInstanceType = () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        networkEdition: hyperledger.NetworkEdition.STARTER,
        nodes: [{}, {}, {}]
      });
    };
    expect(unsupportedInstanceType).toThrow(Error);
  });

  test('Fail to create a starter network with an unsupported instance type', () => {
    expect(hyperledger.STARTER_INSTANCE_TYPES).not.toContain(hyperledger.InstanceType.STANDARD5_LARGE);
    const unsupportedInstanceType = () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        networkEdition: hyperledger.NetworkEdition.STARTER,
        nodes: [
          {
            instanceType: hyperledger.InstanceType.STANDARD5_LARGE
          }
        ]
      });
    };
    expect(unsupportedInstanceType).toThrow(Error);
  });

  test('Create network with node logging disabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: [
        {
          enableNodeLogging: false
        }
      ]
    });

    expect(network.nodes[0].enableNodeLogging).toBe(false);
  });
  test('Create network with node logging enabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: [
        {
          enableNodeLogging: true
        }
      ]
    });

    expect(network.nodes[0].enableNodeLogging).toBe(true);
  });

  test('Create network with chaincode logging disabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: [
        {
          enableChaincodeLogging: false
        }
      ]
    });

    expect(network.nodes[0].enableChaincodeLogging).toBe(false);
  });

  test('Create network with chaincode logging enabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      nodes: [
        {
          enableChaincodeLogging: true
        }
      ]
    });

    expect(network.nodes[0].enableChaincodeLogging).toBe(true);
  });
});
