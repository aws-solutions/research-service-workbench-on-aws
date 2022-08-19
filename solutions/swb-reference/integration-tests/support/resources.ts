/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
import Environments from './resources/environments/environments';

function getResources(clientSession: ClientSession): Resources {
  return {
    environments: new Environments(clientSession),
    datasets: new Datasets(clientSession)
  };
}

interface Resources {
  environments: Environments;
  datasets: Datasets;
}

export { getResources, Resources };
