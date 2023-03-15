/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetsAccessLevelParser } from './dataSetsAccessLevel';

// eslint-disable-next-line @rushstack/typedef-var
export const ExternalEndpointMetadataParser = z.object({
  /**
   * The endpoint's unique identifier.
   */
  id: z.string(),
  /**
   * The name of the endpoint. This is to be unique within a DataSet.
   */
  name: z.string(),
  /**
   * the date and time string at which the DataSet was added to the solution.
   */
  createdAt: z.string(),
  /**
   * The identifier of the DataSet for which the endpoint was created.
   */
  dataSetId: z.string(),
  /**
   * The name of the DataSet for which the endpoint was created.
   */
  dataSetName: z.string(),
  /**
   * The path to the objects(files) in the DataSet storage for this endpoint.
   */
  path: z.string(),
  /**
   * A list of role ARNs for which access has been granted for this endpoint.
   */
  allowedRoles: z.array(z.string()).optional(),
  /**
   * A URL to reach this endpoint.
   */
  endPointUrl: z.string(),
  /**
   * An alias through which the endpoint can be accessed.
   */
  endPointAlias: z.string(),
  /**
   * The {@link DataSetsAccessLevel} the endpoint has.
   */
  accessLevel: DataSetsAccessLevelParser,
  /**
   * Resource type of the endpoint
   */
  resourceType: z.literal('endpoint')
});
