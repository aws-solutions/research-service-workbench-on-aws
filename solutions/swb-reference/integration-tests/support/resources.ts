/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from './clientSession';
import Accounts from './resources/accounts/accounts';
import Datasets from './resources/datasets/datasets';
import Environments from './resources/environments/environments';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession),
    datasets: new Datasets(clientSession),
    accounts: new Accounts(clientSession)
  };
}

interface Resources {
  accounts: Accounts;
  environments: Environments;
  datasets: Datasets;
}

export { getResources, Resources };
