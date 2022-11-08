/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';

function getResources(clientSession: ClientSession): Resources {
  return {
    datasets: new Datasets(clientSession)
  };
}

interface Resources {
  datasets: Datasets;
}

export { getResources, Resources };
