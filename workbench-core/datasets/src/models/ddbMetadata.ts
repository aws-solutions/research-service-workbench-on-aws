/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetsAccessLevelParser } from './dataSetsAccessLevel';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetMetadataParser = z.object({
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
   * Resource type of the dataset
   */
  resourceType: z.literal('dataset')
});

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

// eslint-disable-next-line @rushstack/typedef-var
export const StorageLocationMetadataParser = z.object({
  /**
   * a unique string which identifies the storage specific location such the URL to an S3 bucket.
   */
  name: z.string(),

  /**
   * storage type of the StorageLocation
   */
  type: z.string(),

  /**
   * AWS Account ID of the StorageLocation
   */
  awsAccountId: z.string(),

  /**
   * AWS region of the StorageLocation
   */
  region: z.string(),
  /**
   * Resource type of the StorageLocation
   */
  resourceType: z.literal('datasetStorageLocation')
});
