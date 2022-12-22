/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
import Groups from './resources/dynamicAuthorization/groups';
import Roles from './resources/userManagement/roles';
import Users from './resources/userManagement/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession),
    users: new Users(clientSession),
    roles: new Roles(clientSession),
    groups: new Groups(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
  users: Users;
  roles: Roles;
  groups: Groups;
}

export { getResources, Resources };
