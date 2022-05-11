import { ToolBoxCommandLine } from './toolboxCommandLine.ts';

const commandLine: ToolBoxCommandLine = new ToolBoxCommandLine();
commandLine.execute().catch(console.error);
