/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
// cdk-ssm-document is used instead of 'aws-cdk-lib/aws-ssm` because aws-ssm creates new SSM documents instead of updating existing SSM document
// https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/339
import fs from 'fs';
import { join } from 'path';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Document } from 'cdk-ssm-document';
import { getConstants } from '../constants';

export default class Workflow {
  private _stack: Stack;

  public constructor(stack: Stack) {
    this._stack = stack;
  }

  public createSSMDocuments(): void {
    const { SSM_DOC_OUTPUT_KEY_SUFFIX } = getConstants();
    // Add your new environment type here. The name should exactly match the folder name of the new environment type in the environment folder
    const envTypes = ['sagemakerNotebook'];

    envTypes.forEach((envType) => {
      const docTypes = ['Launch', 'Terminate'];
      docTypes.forEach((docType) => {
        const cfnDoc = new Document(this._stack, `${this._capitalizeFirstLetter(envType)}${docType}`, {
          name: `${this._stack.stackName}-${this._capitalizeFirstLetter(envType)}${docType}`,
          documentType: 'Automation',
          // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
          // correct file
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          content: fs // nosemgrep
            .readFileSync(
              join(__dirname, `../../../src/environment/${envType}/${envType}${docType}SSM.yaml`),
              'utf8'
            )
            .toString()
        });
        new CfnOutput(
          this._stack,
          `${this._capitalizeFirstLetter(envType)}${docType}${SSM_DOC_OUTPUT_KEY_SUFFIX}`,
          {
            value: this._stack.formatArn({
              service: 'ssm',
              resource: 'document',
              resourceName: cfnDoc.name
            })
          }
        );
      });
    });
  }

  private _capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
