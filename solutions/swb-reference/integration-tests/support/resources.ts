/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from './clientSession';
import Accounts from './resources/accounts/accounts';
import CostCenters from './resources/costCenters/costCenters';
import Datasets from './resources/datasets/datasets';
import Environments from './resources/environments/environments';
import EnvironmentTypeConfigs from './resources/environmentTypeConfigs/environmentTypeConfigs';
import EnvironmentTypes from './resources/environmentTypes/environmentTypes';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession),
    datasets: new Datasets(clientSession),
    accounts: new Accounts(clientSession),
    costCenters: new CostCenters(clientSession),
    environmentTypes: new EnvironmentTypes(clientSession),
    environmentTypeConfigs: new EnvironmentTypeConfigs(clientSession)
  };
}

interface Resources {
  accounts: Accounts;
  environments: Environments;
  datasets: Datasets;
  costCenters: CostCenters;
  environmentTypes: EnvironmentTypes;
  environmentTypeConfigs: EnvironmentTypeConfigs;
}

export { getResources, Resources };
