/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 *
 * This code is a derivative of the code from https://github.com/microsoft/rushstack/blob/main/repo-scripts/repo-toolbox/src/ReadmeAction.ts
 *
 */
import path from 'path';
import { RushConfiguration, RushConfigurationProject } from '@microsoft/rush-lib';
import {
  AlreadyReportedError,
  Colors,
  ConsoleTerminalProvider,
  FileSystem,
  IColorableSequence,
  Sort,
  StringBuilder,
  Terminal,
  Text
} from '@rushstack/node-core-library';
import { CommandLineAction, CommandLineFlagParameter } from '@rushstack/ts-command-line';
import * as Diff from 'diff';

const GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT: string = '<!-- GENERATED PROJECT SUMMARY START -->';
const GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT: string = '<!-- GENERATED PROJECT SUMMARY END -->';

export class ReadmeAction extends CommandLineAction {
  private _verifyParameter!: CommandLineFlagParameter;

  public constructor() {
    super({
      actionName: 'readme',
      summary: 'Generates README.md project table based on rush.json inventory',
      documentation: "Use this to update the repo's README.md"
    });
  }

  /**
   * return shouldPublish value for a package
   *
   * @param project - RushConfigurationProject
   * @returns boolean
   */
  private static _isPublished(project: RushConfigurationProject): boolean {
    return project.shouldPublish;
  }

  protected async onExecute(): Promise<void> {
    /**
     * Load rush.json from default location
     */
    const rushConfiguration: RushConfiguration = RushConfiguration.loadFromDefaultLocation();

    /**
     * Read root README.md file
     */
    const repoReadmePath: string = path.resolve(rushConfiguration.rushJsonFolder, 'README.md');
    let existingReadme: string = await FileSystem.readFileAsync(repoReadmePath);
    existingReadme = Text.convertToLf(existingReadme);
    /**
     * Get the first occurrence of start and end comment text
     */
    const generatedProjectSummaryStartIndex = existingReadme.indexOf(
      GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT
    );
    const generatedProjectSummaryEndIndex = existingReadme.indexOf(
      GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT
    );

    /**
     * Check if stand and end comment text exists else throw an error
     */
    if (generatedProjectSummaryStartIndex === -1 || generatedProjectSummaryEndIndex === -1) {
      throw new Error(
        `${GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT} or ${GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT} is missing in ${repoReadmePath}`
      );
    }

    const readmePrefix: string = existingReadme.substring(
      0,
      generatedProjectSummaryStartIndex + GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT.length
    );
    const readmePostfix: string = existingReadme.substring(generatedProjectSummaryEndIndex);

    const builder: StringBuilder = new StringBuilder();

    /**
     * Sort project by relative folder
     */
    const orderedProjects: RushConfigurationProject[] = [...rushConfiguration.projects];
    Sort.sortBy(orderedProjects, (x) => x.projectRelativeFolder);

    /**
     * Append Project info
     */
    builder.append(readmePrefix);
    builder.append('\n\n');
    builder.append('## Packages\n\n');
    builder.append('<!-- the table below was generated using the ./repo-scripts/repo-toolbox script -->\n\n');
    builder.append('| Folder | Package | README |\n');
    builder.append('| ------ | ------- | ------ |\n');
    for (const project of orderedProjects) {
      if (ReadmeAction._isPublished(project)) {
        const folder: string = project.projectRelativeFolder;

        const packageName: string = project.packageName;

        const readme: string = `./${folder}/README.md`;
        builder.append(`| [${folder}](./${folder}/) | [${packageName}] | [README](${readme})\n`);
      }
    }
    builder.append(readmePostfix);

    const readmeString: string = builder.toString();
    const diff: Diff.Change[] = Diff.diffLines(existingReadme, readmeString);
    const readmeIsUpToDate: boolean = diff.length === 1 && !diff[0].added && !diff[0].removed;

    const terminal: Terminal = new Terminal(new ConsoleTerminalProvider());

    if (!readmeIsUpToDate) {
      if (this._verifyParameter.value) {
        for (const change of diff) {
          const lines: string[] = change.value.trimEnd().split('\n');
          let linePrefix: string;
          let colorizer: (text: string | IColorableSequence) => IColorableSequence;
          if (change.added) {
            linePrefix = '+ ';
            colorizer = Colors.green;
          } else if (change.removed) {
            linePrefix = '- ';
            colorizer = Colors.red;
          } else {
            linePrefix = '  ';
            colorizer = Colors.gray;
          }

          for (const line of lines) {
            terminal.writeLine(colorizer(linePrefix + line));
          }
        }

        terminal.writeLine();
        terminal.writeLine();
        terminal.writeErrorLine(
          `The README.md needs to be updated. Please run 'repo-toolbox readme' to update the README.md.`
        );

        throw new AlreadyReportedError();
      } else {
        terminal.writeLine(`Writing ${repoReadmePath}`);
        await FileSystem.writeFileAsync(repoReadmePath, readmeString);
        terminal.writeLine();
        terminal.writeLine(Colors.green('\nSuccess.'));
      }
    } else {
      console.log(`The README.md is up to date.`);
    }
  }

  protected onDefineParameters(): void {
    this._verifyParameter = this.defineFlagParameter({
      parameterLongName: '--verify',
      parameterShortName: '-v',
      description: 'Verify that the README.md file is up-to-date.'
    });
  }
}
