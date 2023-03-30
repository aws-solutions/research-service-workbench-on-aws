/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Expected key:value - 'org': ['repo1', 'repo2']
 */
export const gitHubOrgToRepos: Record<string, string[]> = {
  'aws-solutions': ['solution-spark-on-aws']
};

// This value should be updated if you change the value here: workbench-core/example/infrastructure/integration-tests/config/testEnv.yaml
export const mafSsmBasePath: string = 'maf/exampleApp/rootUser';
// This value should be updated if you change the value here: workbench-core/example/infrastructure/src/index.ts
export const mafCrossAccountRoleName: string = 'ExampleCrossAccountRole';
// MaxSessionDuration in secs for MAF
export const mafMaxSessionDuration: number = 3600;

// Stage name used for swb integration test in the github workflow
export const swbBase: string = 'swb';
export const swbStage: string = 'sam';
export const swbRegionShortName: string = 'oh';
// MaxSessionDuration in secs for MAF
export const swbMaxSessionDuration: number = 7200;
