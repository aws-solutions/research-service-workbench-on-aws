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
    new WorkbenchAppRegistry(stack, stack.stackId, {
      solutionId: 'T001',
      solutionName: 'TestApp',
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
        'Service Catalog application to track and manage all your resources for the solution TestApp',
      Tags: {
        'Solutions:ApplicationType': {
          'Fn::FindInMap': ['TestAppAppRegMap', 'Data', 'ApplicationType']
        },
        'Solutions:SolutionID': {
          'Fn::FindInMap': ['TestAppAppRegMap', 'Data', 'ID']
        },
        'Solutions:SolutionName': {
          'Fn::FindInMap': ['TestAppAppRegMap', 'Data', 'SolutionName']
        },
        'Solutions:SolutionVersion': {
          'Fn::FindInMap': ['TestAppAppRegMap', 'Data', 'Version']
        }
      },
      Name: {
        'Fn::Join': [
          '-',
          [
            {
              'Fn::FindInMap': ['TestAppAppRegMap', 'Data', 'AppRegistryApplicationName']
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
        'Fn::GetAtt': ['AppRegistry968496A3', 'Id']
      },
      AttributeGroup: {
        'Fn::GetAtt': ['DefaultApplicationAttributesFC1CC26B', 'Id']
      }
    });
  });

  test('Share application with another account test', () => {
    const stack = new Stack();
    new WorkbenchAppRegistry(stack, stack.stackId, {
      solutionId: 'T001',
      solutionName: 'TestApp',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['012345678901']
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ServiceCatalogAppRegistry::Application', 1);

    template.hasResourceProperties('AWS::RAM::ResourceShare', {
      Name: 'RAMShare4a089a0c3eab',
      AllowExternalPrincipals: false,
      PermissionArns: [
        'arn:aws:ram::aws:permission/AWSRAMPermissionServiceCatalogAppRegistryAttributeGroupAllowAssociation'
      ],
      Principals: ['012345678901'],
      ResourceArns: [
        {
          'Fn::GetAtt': ['DefaultApplicationAttributesFC1CC26B', 'Arn']
        }
      ]
    });
  });

  test('Associate stacks to appRegistry application Test', () => {
    const testStack1 = new Stack();
    const testStack2 = new Stack();
    const testAppRegistry = new WorkbenchAppRegistry(testStack1, testStack1.stackId, {
      solutionId: 'T001',
      solutionName: 'TestApp',
      solutionVersion: '0.0.1',
      attributeGroupName: 'TestApp-Metadata',
      applicationType: 'Test',
      appRegistryApplicationName: 'TestApp',
      accountIds: ['012345678901']
    });

    testAppRegistry.applyAppRegistryToStacks([testStack2]);

    const template = Template.fromStack(testStack1);

    template.hasResourceProperties('AWS::ServiceCatalogAppRegistry::ResourceAssociation', {
      Application: {
        'Fn::GetAtt': ['AppRegistry968496A3', 'Id']
      },
      Resource: {
        Ref: 'AWS::StackId'
      },
      ResourceType: 'CFN_STACK'
    });
  });
});
