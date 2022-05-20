/**
 *
 * This code is a derivative of the code from https://github.com/microsoft/rushstack/blob/main/repo-scripts/repo-toolbox/src/ReadmeAction.ts
 *
 */
import { ToolBoxCommandLine } from './toolboxCommandLine';

const commandLine: ToolBoxCommandLine = new ToolBoxCommandLine();
commandLine.execute().catch(console.error);
