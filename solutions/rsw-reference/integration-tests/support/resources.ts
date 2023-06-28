/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from './clientSession';
import Accounts from './resources/accounts/accounts';
import CostCenters from './resources/costCenters/costCenters';
import Datasets from './resources/datasets/datasets';
import Environments from './resources/environments/environments';
import EnvironmentTypes from './resources/environmentTypes/environmentTypes';
import Projects from './resources/projects/projects';
import SshKeys from './resources/sshKeys/sshKeys';
import Users from './resources/users/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession),
    datasets: new Datasets(clientSession),
    accounts: new Accounts(clientSession),
    users: new Users(clientSession),
    costCenters: new CostCenters(clientSession),
    environmentTypes: new EnvironmentTypes(clientSession),
    projects: new Projects(clientSession),
    sshKeys: new SshKeys(clientSession)
  };
}

interface Resources {
  accounts: Accounts;
  environments: Environments;
  datasets: Datasets;
  users: Users;
  costCenters: CostCenters;
  environmentTypes: EnvironmentTypes;
  projects: Projects;
  sshKeys: SshKeys;
}

export { getResources, Resources };
