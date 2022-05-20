/**
 *
 * This code is a derivative of the code from https://github.com/microsoft/rushstack/blob/main/repo-scripts/repo-toolbox/src/ReadmeAction.ts
 *
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
