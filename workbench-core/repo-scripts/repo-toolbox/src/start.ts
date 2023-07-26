/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ToolBoxCommandLine } from './toolboxCommandLine';

const commandLine: ToolBoxCommandLine = new ToolBoxCommandLine();
commandLine.execute().catch(console.error);
