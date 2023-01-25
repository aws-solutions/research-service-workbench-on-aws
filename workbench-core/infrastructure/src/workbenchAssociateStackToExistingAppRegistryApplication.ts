/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Application } from '@aws-cdk/aws-servicecatalogappregistry-alpha';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createAppInsightsConfiguration } from './helpers';

export interface WorkbenchAssociateStackToExistingAppRegistryApplicationProps {
  applicationArn: string;
}

export class WorkbenchAssociateStackToExistingAppRegistryApplication extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: WorkbenchAssociateStackToExistingAppRegistryApplicationProps
  ) {
    super(scope, id);
    const stack: Stack = scope as Stack;

    this._associateApplicationWithStack(props.applicationArn, stack, id);
  }

  private _associateApplicationWithStack(applicationArn: string, stack: Stack, id: string): void {
    const importedApplication = Application.fromApplicationArn(
      this,
      `${id}-importedApplication`,
      applicationArn
    );

    importedApplication.associateApplicationWithStack(stack);
    createAppInsightsConfiguration(stack);
  }
}
