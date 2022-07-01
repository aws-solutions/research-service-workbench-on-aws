/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

import * as cdknag from 'cdk-nag';

import { NagSuppressions } from 'cdk-nag';
import * as hyperledger from '../components';

const DEFAULT_ENV = { env: { region: 'us-east-1' } };

const TOKEN_REGEXP = /^\$\{Token\[TOKEN\.[0-9]+\]\}$/;

describe('HyperledgerFabricNetwork', () => {
  test('Create a network with default values', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember'
    });
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Member', 1);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          Name: 'TestNetwork',
          Description: 'TestNetwork',
          Framework: 'HYPERLEDGER_FABRIC',
          FrameworkVersion: '2.2',
          NetworkFrameworkConfiguration: {
            NetworkFabricConfiguration: {
              Edition: 'STANDARD'
            }
          },
          VotingPolicy: {
            ApprovalThresholdPolicy: {
              ProposalDurationInHours: 24,
              ThresholdPercentage: 50,
              ThresholdComparator: 'GREATER_THAN'
            }
          }
        },
        MemberConfiguration: {
          Name: 'TestMember',
          Description: 'TestMember'
        }
      }
    });
    expect(network.networkName).toBe('TestNetwork');
    expect(network.networkDescription).toBe('TestNetwork');
    expect(network.networkId).toMatch(TOKEN_REGEXP);
    expect(network.memberName).toBe('TestMember');
    expect(network.memberDescription).toBe('TestMember');
    expect(network.networkId).toMatch(TOKEN_REGEXP);
    expect(network.frameworkVersion).toBe(hyperledger.FrameworkVersion.VERSION_2_2);
    expect(network.networkEdition).toBe(hyperledger.NetworkEdition.STANDARD);
    expect(network.proposalDurationInHours).toBe(24);
    expect(network.thresholdPercentage).toBe(50);
    expect(network.thresholdComparator).toBe(hyperledger.ThresholdComparator.GREATER_THAN);
    expect(network.vpcEndpointServiceName).toMatch(TOKEN_REGEXP);
    expect(network.ordererEndpoint).toMatch(TOKEN_REGEXP);
    expect(network.caEndpoint).toMatch(TOKEN_REGEXP);
    expect(network.adminPasswordSecret).toBeInstanceOf(secretsmanager.Secret);
    expect(network.adminPrivateKeySecret).toBeInstanceOf(secretsmanager.Secret);
    expect(network.adminSignedCertSecret).toBeInstanceOf(secretsmanager.Secret);
    expect(network.enableCaLogging).toBe(true);
  });

  test('Create a network with custom descriptions', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      networkDescription: 'This is a test network',
      memberName: 'TestMember',
      memberDescription: 'This is a test member'
    });
    const template = assertions.Template.fromStack(stack);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          Description: 'This is a test network'
        },
        MemberConfiguration: {
          Description: 'This is a test member'
        }
      }
    });
    expect(network.networkDescription).toBe('This is a test network');
    expect(network.memberDescription).toBe('This is a test member');
  });

  test('Create a network with a custom voting policy', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      proposalDurationInHours: 12,
      thresholdPercentage: 75,
      thresholdComparator: hyperledger.ThresholdComparator.GREATER_THAN_OR_EQUAL_TO
    });
    const template = assertions.Template.fromStack(stack);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          VotingPolicy: {
            ApprovalThresholdPolicy: {
              ProposalDurationInHours: 12,
              ThresholdPercentage: 75,
              ThresholdComparator: 'GREATER_THAN_OR_EQUAL_TO'
            }
          }
        }
      }
    });
    expect(network.proposalDurationInHours).toBe(12);
    expect(network.thresholdPercentage).toBe(75);
    expect(network.thresholdComparator).toBe(hyperledger.ThresholdComparator.GREATER_THAN_OR_EQUAL_TO);
  });

  test('Create a starter edition network', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkEdition: hyperledger.NetworkEdition.STARTER,
      networkName: 'TestNetwork',
      memberName: 'TestMember'
    });
    const template = assertions.Template.fromStack(stack);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          NetworkFrameworkConfiguration: {
            NetworkFabricConfiguration: {
              Edition: 'STARTER'
            }
          }
        }
      }
    });
    expect(network.networkEdition).toBe(hyperledger.NetworkEdition.STARTER);
  });

  test('Create a network with framework version 1.2', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      frameworkVersion: hyperledger.FrameworkVersion.VERSION_1_2
    });
    const template = assertions.Template.fromStack(stack);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          FrameworkVersion: '1.2'
        }
      }
    });
    expect(network.frameworkVersion).toBe(hyperledger.FrameworkVersion.VERSION_1_2);
  });

  test('Create a network with framework version 2.2', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      frameworkVersion: hyperledger.FrameworkVersion.VERSION_2_2
    });
    const template = assertions.Template.fromStack(stack);
    template.hasResource('AWS::ManagedBlockchain::Member', {
      Properties: {
        NetworkConfiguration: {
          FrameworkVersion: '2.2'
        }
      }
    });
    expect(network.frameworkVersion).toBe(hyperledger.FrameworkVersion.VERSION_2_2);
  });

  test('Create network with CA Logging disabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      enableCaLogging: false
    });

    expect(network.enableCaLogging).toBe(false);
  });

  test('Create network with CA logging enabled', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
    const network = new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember',
      enableCaLogging: true
    });

    expect(network.enableCaLogging).toBe(true);
  });

  test('Fail to create a network in an unsupported region', () => {
    expect(hyperledger.SUPPORTED_REGIONS).not.toContain('us-west-1');
    const unsupportedRegion = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', { env: { region: 'us-west-1' } });
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember'
      });
    };
    expect(unsupportedRegion).toThrow(Error);
  });

  test('Fail to create a network with invalid network name', () => {
    const nameTooShort = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: '',
        memberName: 'TestMember'
      });
    };
    const nameTooLong = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'ThisNetworkNameIsSixtyFiveCharactersLongAndThatIsTooLongToWork123',
        memberName: 'TestMember'
      });
    };
    expect(nameTooShort).toThrow(Error);
    expect(nameTooLong).toThrow(Error);
  });

  test('Fail to create a network with invalid network description', () => {
    const descriptionTooLong = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        networkDescription:
          'ThisNetworkDescriptionIsOneHundredTwentyNineCharactersLongAndThatIsTooLongToWork1234567890123456789012345678901234567890123456789',
        memberName: 'TestMember'
      });
    };
    expect(descriptionTooLong).toThrow(Error);
  });

  test('Fail to create a network with invalid member name', () => {
    const nameTooShort = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: ''
      });
    };
    const nameTooLong = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'ThisMemberNameIsSixtyFiveCharactersLongAndThatIsTooLongToWork1234'
      });
    };
    const nameStartsWithNumber = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: '0TestMember'
      });
    };
    const nameStartsAndEndsWithHyphen = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: '-TestMember-'
      });
    };
    const nameHasConsecutiveHyphens = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'Test--Member'
      });
    };
    expect(nameTooShort).toThrow(Error);
    expect(nameTooLong).toThrow(Error);
    expect(nameStartsWithNumber).toThrow(Error);
    expect(nameStartsAndEndsWithHyphen).toThrow(Error);
    expect(nameHasConsecutiveHyphens).toThrow(Error);
  });

  test('Fail to create a network with invalid member description', () => {
    const descriptionTooLong = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        memberDescription:
          'ThisMemberDescriptionIsOneHundredTwentyNineCharactersLongAndThatIsTooLongToWork12345678901234567890123456789012345678901234567890'
      });
    };
    expect(descriptionTooLong).toThrow(Error);
  });

  test('Fail to create a network with an invalid voting policy proposal duration', () => {
    const durationTooShort = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        proposalDurationInHours: 0
      });
    };
    const durationTooLong = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        proposalDurationInHours: 169
      });
    };
    const durationNotInteger = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        proposalDurationInHours: 3.14159
      });
    };
    expect(durationTooShort).toThrow(Error);
    expect(durationTooLong).toThrow(Error);
    expect(durationNotInteger).toThrow(Error);
  });

  test('Fail to create a network with an invalid voting policy threshold percentage', () => {
    const thresholdTooSmall = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        thresholdPercentage: -1
      });
    };
    const thresholdTooLarge = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        thresholdPercentage: 101
      });
    };
    const thresholdNotInteger = (): void => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack', DEFAULT_ENV);
      new hyperledger.HyperledgerFabricNetwork(stack, 'TestHyperledgerFabricNetwork', {
        networkName: 'TestNetwork',
        memberName: 'TestMember',
        thresholdPercentage: 1.61803
      });
    };
    expect(thresholdTooSmall).toThrow(Error);
    expect(thresholdTooLarge).toThrow(Error);
    expect(thresholdNotInteger).toThrow(Error);
  });

  test('No unexpected CDK nag errors occur in stack', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'HyperledgerTestStack', DEFAULT_ENV);
    new hyperledger.HyperledgerFabricNetwork(stack, 'V2TestNetwork', {
      networkName: 'TestNetwork',
      memberName: 'TestMember'
    });

    cdknag.NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'AwsSolutions-IAM4',
        reason:
          'The CDK custom resource framework uses a managed policy for its Lambda, and the name for the Lambda is randomly generated'
      },
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'The CDK custom resource framework uses wildcard permission for its Lambda, and the name for the Lambda is randomly generated'
      },
      {
        id: 'AwsSolutions-L1',
        reason:
          'The CDK custom resource framework uses NodeJS 12 and NodeJS 14 for onEvent trigger, and the name for these resources are randomly generated'
      }
    ]);

    NagSuppressions.addResourceSuppressionsByPath(
      stack,
      '/HyperledgerTestStack/V2TestNetwork/AdminPassword/Resource',
      [
        {
          id: 'AwsSolutions-SMG4',
          reason: 'Secrets created for Managed Blockchain users do not support auto-rotation'
        }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      stack,
      '/HyperledgerTestStack/V2TestNetwork/AdminPrivateKey/Resource',
      [
        {
          id: 'AwsSolutions-SMG4',
          reason: 'Secrets created for Managed Blockchain users do not support auto-rotation'
        }
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      stack,
      '/HyperledgerTestStack/V2TestNetwork/AdminSignedCert/Resource',
      [
        {
          id: 'AwsSolutions-SMG4',
          reason: 'Secrets created for Managed Blockchain users do not support auto-rotation'
        }
      ]
    );
    cdk.Aspects.of(stack).add(new cdknag.AwsSolutionsChecks({ verbose: true }));
    const annotations = assertions.Annotations.fromStack(stack);
    const errors = annotations.findError('*', assertions.Match.stringLikeRegexp('AwsSolutions-.*'));
    expect(errors).toHaveLength(0);
  });
});
