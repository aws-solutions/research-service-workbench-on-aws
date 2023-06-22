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
  appInsights?: boolean;
}

export class WorkbenchAssociateStackToExistingAppRegistryApplication extends Construct {
  private _appInsights: boolean;

  public constructor(
    scope: Construct,
    id: string,
    props: WorkbenchAssociateStackToExistingAppRegistryApplicationProps
  ) {
    super(scope, id);
    const stack: Stack = scope as Stack;
    this._appInsights = props.appInsights ? props.appInsights : false;

    this._associateApplicationWithStack(props.applicationArn, stack, id);
  }

  private _associateApplicationWithStack(applicationArn: string, stack: Stack, id: string): void {
    const importedApplication = Application.fromApplicationArn(
      this,
      `${id}-importedApplication`,
      applicationArn
    );

    importedApplication.associateApplicationWithStack(stack);

    if (this._appInsights) {
      createAppInsightsConfiguration(stack);
    }
  }
}
