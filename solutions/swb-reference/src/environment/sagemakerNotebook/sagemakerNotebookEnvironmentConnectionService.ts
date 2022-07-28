/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import {
  EnvironmentConnectionService,
  EnvironmentConnectionLinkPlaceholder
} from '@amzn/workbench-core-environments';

export default class SagemakerNotebookEnvironmentConnectionService implements EnvironmentConnectionService {
  /**
   * Get credentials for connecting to the environment
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async getAuthCreds(instanceName: string, context?: any): Promise<any> {
    const region = process.env.AWS_REGION!;
    const awsService = new AwsService({ region });
    const hostingAccountAwsService = await awsService.getAwsServiceForRole({
      roleArn: context.roleArn,
      roleSessionName: `SagemakerConnect-${Date.now()}`,
      externalId: context.externalId,
      region
    });

    const response = await hostingAccountAwsService.clients.sagemaker.createPresignedNotebookInstanceUrl({
      NotebookInstanceName: instanceName
    });
    return { url: response.AuthorizedUrl };
  }

  /**
   * Instructions for connecting to the workspace that can be shown verbatim in the UI
   */
  public getConnectionInstruction(): Promise<string> {
    // "url" is the key of the response returned by the method `getAuthCreds`
    const link: EnvironmentConnectionLinkPlaceholder = {
      type: 'link',
      hrefKey: 'url',
      text: 'Sagemaker URL'
    };
    return Promise.resolve(`To access Sagemaker Notebook, open #${JSON.stringify(link)}`);
  }
}
