/* eslint-disable no-new */
// cdk-ssm-document is used instead of 'aws-cdk-lib/aws-ssm` because aws-ssm creates new SSM documents instead of updating existing SSM document
// https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/339
import { Document } from 'cdk-ssm-document';
import { join } from 'path';
import fs from 'fs';
import { CfnOutput, Stack } from 'aws-cdk-lib';

export default class Workflow {
  private _stack: Stack;

  public constructor(stack: Stack) {
    this._stack = stack;
  }

  public createSSMDocuments(): void {
    this._createSagemakerSSMDocuments();
  }

  private _createSagemakerSSMDocuments(): void {
    const cfnDoc = new Document(this._stack, 'SagemakerLaunch', {
      name: `${this._stack.stackName}-SagemakerLaunch`,
      documentType: 'Automation',
      // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
      // correct file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      content: fs // nosemgrep
        .readFileSync(join(__dirname, `../../src/environment/sagemaker/sagemakerLaunchSSM.yaml`), 'utf8')
        .toString()
    });

    new CfnOutput(this._stack, 'SagemakerLaunchSSMDocOutput', {
      value: this._stack.formatArn({
        service: 'ssm',
        resource: 'document',
        resourceName: cfnDoc.name
      })
    });
  }
}
