/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
import Users from './resources/users/users';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession),
    users: new Users(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
  users: Users;
}

export { getResources, Resources };
