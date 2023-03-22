/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetPermissionParser } from './dataSetPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetParser = z.object({
  /**
   * an internally generated value which uniquely identifies the dataset.
   */
  id: z.string(),
  /**
   * the name of a DataSet
   */
  name: z.string(),
  /**
   * the date and time string at which the DataSet was added to the solution.
   */
  createdAt: z.string(),
  /**
   * (optional) a description of the dataset
   */
  description: z.string().optional(),
  /**
   * (optional) the owner of the dataset
   */
  owner: z.string().optional(),
  /**
   * (optional, but required if `owner` is specified.) the identity type of the owner such as 'USER' or 'GROUP')
   */
  ownerType: z.string().optional(),
  /**
   * (optional) the type of the dataset
   */
  type: z.string().optional(),
  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  storageName: z.string(),
  /**
   * Storage Type of the DataSet
   */
  storageType: z.string(),
  /**
   * the storage path where the DataSet files can be found at the location.
   */
  path: z.string(),
  /**
   * the Ids endpoints through which the dataset is accessible.
   */
  externalEndpoints: z.array(z.string()).optional(),

  /**
   * AWS Account ID of DataSet
   */
  awsAccountId: z.string().optional(),
  /**
   * AWS region of the dataset storage
   */
  region: z.string().optional(),
  /**
   * Permissions associated with the DataSet
   */
  permissions: z.array(DataSetPermissionParser).optional()
});

export type DataSet = z.infer<typeof DataSetParser>;

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetArrayParser = z.array(DataSetParser);

export type CreateDataSet = Omit<DataSet, 'id' | 'createdAt'>;
