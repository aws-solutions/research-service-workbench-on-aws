import { AwsService } from '@amzn/workbench-core-base';

async function getCfnOutput(
  awsService: AwsService,
  stackName: string,
  outputKeys: string[]
): Promise<{ [key: string]: string }> {
  const outputValues: { [key: string]: string } = {};
  for (const outputKey of outputKeys) {
    const describeStackParam = {
      StackName: stackName
    };

    const stackOutput = await awsService.cloudformation.describeStacks(describeStackParam);
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

export { getCfnOutput };
