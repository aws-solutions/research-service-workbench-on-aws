/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
import Groups from './resources/dynamicAuthorization/groups';
import IdentityPermissions from './resources/dynamicAuthorization/identityPermissions';
import Users from './resources/users/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession),
    users: new Users(clientSession),
    groups: new Groups(clientSession),
    identityPermissions: new IdentityPermissions(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
  users: Users;
  groups: Groups;
  identityPermissions: IdentityPermissions;
}

export { getResources, Resources };
