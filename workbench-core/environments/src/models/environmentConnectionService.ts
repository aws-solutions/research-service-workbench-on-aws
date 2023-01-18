/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export default interface EnvironmentConnectionService {
  /**
   * Get credentials for connecting to the environment
   * @param instanceName - uniqueId of instance
   * @param context - any additional attributes that might be required to get credentials for connecting to the environment
   * @returns - attributes that should be provided to the requester so that they can connect to the environment
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getAuthCreds(instanceName: string, context?: any): Promise<any>;

  /**
   * Instructions for connecting to the workspace that can be shown verbatim in the UI. You can use the `environmentConnectionLinkPlaceholder` to dynamically add a link to the instruction
   * @returns instructions for connecting to the workspace
   *
   * @example
   * ```
   *  const link: EnvironmentConnectionLinkPlaceholder = {
   *       type: 'link',
   *       hrefKey: 'url',
   *       text: 'Sagemaker URL'
   * };
   * return Promise.resolve(`To access Sagemaker Notebook, open #${JSON.stringify(link)}`);
   *```
   */
  // TODO: Figure out the correct parameters for this method
  getConnectionInstruction(): Promise<string>;
}
