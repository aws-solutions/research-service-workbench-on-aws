import CloudFormation from './services/cloudformation';

export default class CloudformationService {
  private _cloudformation: CloudFormation;

  public constructor(cloudformation: CloudFormation) {
    this._cloudformation = cloudformation;
  }

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
