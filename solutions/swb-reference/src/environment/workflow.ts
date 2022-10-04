/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import fs from 'fs';
import { join } from 'path';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { CfnDocument } from 'aws-cdk-lib/aws-ssm';
import yaml from 'js-yaml';
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
        const ssmDoc = yaml.load(
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.readFileSync(
            join(__dirname, `../../../src/environment/${envType}/${envType}${docType}SSM.yaml`),
            'utf8'
          )
        );

        const cfnDoc = new CfnDocument(this._stack, `${this._capitalizeFirstLetter(envType)}${docType}`, {
          content: ssmDoc,
          documentType: 'Automation',
          updateMethod: 'NewVersion'
        });

        new CfnOutput(
          this._stack,
          `${this._capitalizeFirstLetter(envType)}${docType}${SSM_DOC_OUTPUT_KEY_SUFFIX}`,
          {
            value: this._stack.formatArn({
              service: 'ssm',
              resource: 'document',
              resourceName: cfnDoc.ref
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
