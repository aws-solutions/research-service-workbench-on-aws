/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from './clientSession';
import Accounts from './resources/accounts/accounts';
import Datasets from './resources/datasets/datasets';
import Environments from './resources/environments/environments';
import Projects from './resources/projects/projects';
import Users from './resources/users/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession),
    datasets: new Datasets(clientSession),
    accounts: new Accounts(clientSession),
    users: new Users(clientSession),
    projects: new Projects(clientSession)
  };
}

interface Resources {
  accounts: Accounts;
  environments: Environments;
  datasets: Datasets;
  users: Users;
  projects: Projects;
}

export { getResources, Resources };
