/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CloudFormation } from '@aws-sdk/client-cloudformation';

export default class CloudformationService {
  private _cloudformation: CloudFormation;

  public constructor(cloudformation: CloudFormation) {
    this._cloudformation = cloudformation;
  }

  /**
   * Get Cloudformation output from a stack
   * @example
   * ```
   * // returns { 'lambdaRoleArn': "ExampleRoleArn" }
   * getCfnOutput('stack123', ['lambdaRoleArn'])
   * ```
   *
   * @param stackName - Stack name of CFN stack to get cloudformation output from
   * @param outputKeys - Output keys to get value for
   * @returns An object where the key is the output key and the value is the cloudformation output of that key.
   */
  public async getCfnOutput(stackName: string, outputKeys: string[]): Promise<{ [key: string]: string }> {
    const outputValues: { [key: string]: string } = {};
    for (const outputKey of outputKeys) {
      const describeStackParam = {
        StackName: stackName
      };

      const stackOutput = await this._cloudformation.describeStacks(describeStackParam);
      const describeStackResponse = stackOutput.Stacks![0].Outputs!.find((output) => {
        return output.OutputKey && output.OutputKey.includes(outputKey);
      });
      if (describeStackResponse && describeStackResponse.OutputValue) {
        // eslint-disable-next-line security/detect-object-injection
        outputValues[outputKey] = describeStackResponse.OutputValue;
      } else {
        throw new Error(`Cannot find output value for ${outputKey}`);
      }
    }
    return outputValues;
  }
}
