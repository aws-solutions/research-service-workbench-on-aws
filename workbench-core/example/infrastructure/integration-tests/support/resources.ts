/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import AuditEntry from './resources/audit/auditEntry';
import Authentication from './resources/authentication/authentication';
import { StaticAuthorization } from './resources/authorization/staticAuthorization';
import Datasets from './resources/datasets/datasets';
import Groups from './resources/dynamicAuthorization/groups';
import IdentityPermissions from './resources/dynamicAuthorization/identityPermissions';
import RoutesProtection from './resources/dynamicAuthorization/routeProtection';
import Roles from './resources/userManagement/roles';
import Users from './resources/userManagement/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession),
    users: new Users(clientSession),
    groups: new Groups(clientSession),
    identityPermissions: new IdentityPermissions(clientSession),
    roles: new Roles(clientSession),
    routesProtection: new RoutesProtection(clientSession),
    auditEntry: new AuditEntry(clientSession),
    authentication: new Authentication(clientSession),
    staticAuthorization: new StaticAuthorization(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
  users: Users;
  roles: Roles;
  groups: Groups;
  identityPermissions: IdentityPermissions;
  routesProtection: RoutesProtection;
  auditEntry: AuditEntry;
  authentication: Authentication;
  staticAuthorization: StaticAuthorization;
}

export { getResources, Resources };
