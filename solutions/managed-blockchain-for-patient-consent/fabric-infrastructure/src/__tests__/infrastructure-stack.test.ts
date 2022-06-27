/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';

import * as cdknag from 'cdk-nag';
import { InfrastructureStack } from '../infrastructure-stack';

const DEFAULT_ENV = { env: { region: 'us-east-1', account: '1234567890' } };

describe('InfrastructureStack', () => {
  test('InfrastructureStack is created with expected configuration', () => {
    const app = new cdk.App({ context: {} });
    const stack = new InfrastructureStack(app, 'HyperledgerTestStack', DEFAULT_ENV);
    cdk.Aspects.of(stack).add(new cdknag.AwsSolutionsChecks({ verbose: true }));
    const template = assertions.Template.fromStack(stack);
    template.resourceCountIs('AWS::ManagedBlockchain::Member', 1);
    template.hasResourceProperties('AWS::ManagedBlockchain::Member', {
      NetworkConfiguration: {
        Name: 'TestNetwork',
        Description: 'TestNetwork',
        Framework: 'HYPERLEDGER_FABRIC',
        FrameworkVersion: '2.2',
        NetworkFrameworkConfiguration: {
          NetworkFabricConfiguration: {
            Edition: 'STARTER'
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
        Name: 'TestMember-1234567890',
        Description: 'TestMember-1234567890'
      }
    });
    template.resourceCountIs('AWS::ManagedBlockchain::Node', 1);
    template.hasResourceProperties('AWS::ManagedBlockchain::Node', {
      NodeConfiguration: { AvailabilityZone: 'us-east-1a', InstanceType: 'bc.t3.medium' }
    });
    console.log(template.findResources('AWS::ManagedBlockchain::Node').metadata);
  });
});
