/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const accountResourceTypeToKey: {
  project: string;
  awsAccount: string;
  account: string;
} = {
  project: 'PROJ',
  awsAccount: 'AWSACC',
  account: 'ACC'
};

export default accountResourceTypeToKey;
