/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CommandLineParser } from '@rushstack/ts-command-line';
import { ReadmeAction } from './readmeAction';

export class ToolBoxCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: 'toolbox',
      toolDescription: 'Used to execute various operations specific to this repo'
    });

    this.addAction(new ReadmeAction());
  }

  protected onDefineParameters(): void {
    // abstract
  }

  protected onExecute(): Promise<void> {
    // override
    return super.onExecute();
  }
}
