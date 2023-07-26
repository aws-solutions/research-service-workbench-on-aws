/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const resourceTypeToKey: {
  environment: string;
  project: string;
  envType: string;
  envTypeConfig: string;
  dataset: string;
  endpoint: string;
  instance: string;
  awsAccount: string;
  account: string;
  costCenter: string;
  sshKey: string;
} = {
  environment: 'ENV',
  project: 'PROJ',
  envType: 'ET',
  envTypeConfig: 'ETC',
  dataset: 'DATASET',
  endpoint: 'ENDPOINT',
  instance: 'INID',
  awsAccount: 'AWSACC',
  account: 'ACC',
  costCenter: 'CC',
  sshKey: 'SSHKEY'
};

export default resourceTypeToKey;
