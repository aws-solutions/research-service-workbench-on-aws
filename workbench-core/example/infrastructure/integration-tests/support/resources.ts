/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
import Groups from './resources/dynamicAuthorization/groups';
import IdentityPermissions from './resources/dynamicAuthorization/identityPermissions';
import Roles from './resources/userManagement/roles';
import Users from './resources/userManagement/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession),
    users: new Users(clientSession),
    groups: new Groups(clientSession),
    identityPermissions: new IdentityPermissions(clientSession),
    roles: new Roles(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
  users: Users;
  roles: Roles;
  groups: Groups;
  identityPermissions: IdentityPermissions;
}

export { getResources, Resources };
