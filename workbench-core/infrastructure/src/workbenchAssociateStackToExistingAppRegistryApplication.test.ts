/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WorkbenchAssociateStackToExistingAppRegistryApplication } from './workbenchAssociateStackToExistingAppRegistryApplication';

describe('WorkbenchAppRegistry Test', () => {
  test('default values', () => {
    const stack = new Stack();
    new WorkbenchAssociateStackToExistingAppRegistryApplication(stack, 'TestStack', {
      applicationArn: 'arn:aws:servicecatalog:us-east-1:111111111111:/applications/appRegApplication'
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ServiceCatalogAppRegistry::ResourceAssociation', 1);
    template.hasResourceProperties('AWS::ServiceCatalogAppRegistry::ResourceAssociation', {
      Application: 'appRegApplication',
      Resource: {
        Ref: 'AWS::StackId'
      },
      ResourceType: 'CFN_STACK'
    });
  });

  test('AppInsights is created', () => {
    const stack = new Stack();
    new WorkbenchAssociateStackToExistingAppRegistryApplication(stack, 'TestStack', {
      applicationArn: 'arn:aws:servicecatalog:us-east-1:111111111111:/applications/appRegApplication',
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
});
