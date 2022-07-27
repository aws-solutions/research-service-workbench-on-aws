import { ToolBoxCommandLine } from './toolboxCommandLine';

const commandLine: ToolBoxCommandLine = new ToolBoxCommandLine();
commandLine.execute().catch(console.error);
