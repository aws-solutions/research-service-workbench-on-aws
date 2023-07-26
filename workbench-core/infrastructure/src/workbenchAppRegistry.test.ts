/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WorkbenchAppRegistry } from './workbenchAppRegistry';

describe('WorkbenchAppRegistry Test', () => {
  test('default values', () => {
    const stack = new Stack();
    new WorkbenchAppRegistry(stack, 'TestStack', {
      solutionId: 'T001',
      solutionName: 'Test App',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp'
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ServiceCatalogAppRegistry::Application', 1);
    template.resourceCountIs('AWS::RAM::ResourceShare', 0);
    template.hasResourceProperties('AWS::ServiceCatalogAppRegistry::Application', {
      Description:
        'Service Catalog application to track and manage all your resources for the solution Test App',
      Tags: {
        'Solutions:ApplicationType': {
          'Fn::FindInMap': ['TestStackSolution', 'Data', 'ApplicationType']
        },
        'Solutions:SolutionID': {
          'Fn::FindInMap': ['TestStackSolution', 'Data', 'ID']
        },
        'Solutions:SolutionName': {
          'Fn::FindInMap': ['TestStackSolution', 'Data', 'SolutionName']
        },
        'Solutions:SolutionVersion': {
          'Fn::FindInMap': ['TestStackSolution', 'Data', 'Version']
        }
      },
      Name: {
        'Fn::Join': [
          '-',
          [
            {
              'Fn::FindInMap': ['TestStackSolution', 'Data', 'AppRegistryApplicationName']
            },
            {
              Ref: 'AWS::Region'
            },
            {
              Ref: 'AWS::AccountId'
            }
          ]
        ]
      }
    });

    template.hasResourceProperties('AWS::ServiceCatalogAppRegistry::AttributeGroupAssociation', {
      Application: {
        'Fn::GetAtt': ['TestStackApplicationF250E570', 'Id']
      },
      AttributeGroup: {
        'Fn::GetAtt': ['TestStackAttributeGroup7F76BDF8', 'Id']
      }
    });
  });

  test('Share application with another account test', () => {
    const stack = new Stack();
    new WorkbenchAppRegistry(stack, 'TestStack', {
      solutionId: 'T001',
      solutionName: 'Test App',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['111122223333']
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ServiceCatalogAppRegistry::Application', 1);

    template.hasResourceProperties('AWS::RAM::ResourceShare', {
      Name: 'RAMSharec1f9fb358967',
      AllowExternalPrincipals: false,
      PermissionArns: [
        'arn:aws:ram::aws:permission/AWSRAMPermissionServiceCatalogAppRegistryAttributeGroupAllowAssociation'
      ],
      Principals: ['111122223333'],
      ResourceArns: [
        {
          'Fn::GetAtt': ['TestStackAttributeGroup7F76BDF8', 'Arn']
        }
      ]
    });
  });

  test('Removal Policy Destroy', () => {
    const stack = new Stack();
    new WorkbenchAppRegistry(stack, 'TestStack', {
      solutionId: 'T001',
      solutionName: 'Test App',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['111122223333'],
      destroy: true
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ServiceCatalogAppRegistry::Application', 1);

    template.hasResource('AWS::ServiceCatalogAppRegistry::Application', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });

    template.hasResource('AWS::ServiceCatalogAppRegistry::AttributeGroup', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });
  });

  test('AppInsights gets created', () => {
    const stack = new Stack();
    new WorkbenchAppRegistry(stack, 'TestStack', {
      solutionId: 'T001',
      solutionName: 'Test App',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['111122223333'],
      appInsights: true
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ApplicationInsights::Application', 1);

    template.hasResourceProperties('AWS::ApplicationInsights::Application', {
      ResourceGroupName: 'AWS_CloudFormation_Stack-Default',
      AutoConfigurationEnabled: true,
      CWEMonitorEnabled: true,
      OpsCenterEnabled: true
    });
  });

  test('Associate stacks to appRegistry application Test', () => {
    const testStack1 = new Stack();
    const testStack2 = new Stack();
    const testAppRegistry = new WorkbenchAppRegistry(testStack1, 'TestStack', {
      solutionId: 'T001',
      solutionName: 'Test App',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['111122223333']
    });

    testAppRegistry.applyAppRegistryToStacks([testStack2], false);

    const template = Template.fromStack(testStack1);

    template.hasResourceProperties('AWS::ServiceCatalogAppRegistry::ResourceAssociation', {
      Application: {
        'Fn::GetAtt': ['TestStackApplicationF250E570', 'Id']
      },
      Resource: {
        Ref: 'AWS::StackId'
      },
      ResourceType: 'CFN_STACK'
    });
  });
});
