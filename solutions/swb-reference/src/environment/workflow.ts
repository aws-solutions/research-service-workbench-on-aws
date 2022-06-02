/* eslint-disable no-new */
// cdk-ssm-document is used instead of 'aws-cdk-lib/aws-ssm` because aws-ssm creates new SSM documents instead of updating existing SSM document
// https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/339
import { Document } from 'cdk-ssm-document';
import { join } from 'path';
import fs from 'fs';
import _ from 'lodash';
import { CfnOutput, Stack } from 'aws-cdk-lib';

export default class Workflow {
  private _stack: Stack;

  public constructor(stack: Stack) {
    this._stack = stack;
  }

  public createSSMDocuments(): void {
    // Add your new environment type here. The name should exactly match the folder name of the new environment folder
    const envTypes = ['sagemaker'];

    envTypes.forEach((envType) => {
      const docTypes = ['Launch', 'Terminate'];
      docTypes.forEach((docType) => {
        const cfnDoc = new Document(this._stack, `${_.capitalize(envType)}${docType}`, {
          name: `${this._stack.stackName}-${_.capitalize(envType)}${docType}`,
          documentType: 'Automation',
          // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
          // correct file
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          content: fs // nosemgrep
            .readFileSync(
              join(__dirname, `../../src/environment/${envType}/${envType}${docType}SSM.yaml`),
              'utf8'
            )
            .toString()
        });
        new CfnOutput(this._stack, `${_.capitalize(envType)}${docType}SSMDocOutput`, {
          value: this._stack.formatArn({
            service: 'ssm',
            resource: 'document',
            resourceName: cfnDoc.name
          })
        });
      });
    });
  }
}
