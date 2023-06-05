/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetsStoragePlugin } from '../dataSetsStoragePlugin';
import { DataSetPermission } from './dataSetPermission';

export interface CreateProvisionDatasetRequest {
  /**
   * the name of a DataSet
   */
  name: string;

  /**
   * (optional) a description of the dataset
   */
  description?: string;

  /**
   * (optional) the owner of the dataset
   */
  owner?: string;

  /**
   * (optional, but required if `owner` is specified.) the identity type of the owner such as 'USER' or 'GROUP'
   */
  ownerType?: string;

  /**
   * (optional) the type of the dataset
   */
  type?: string;

  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  storageName: string;

  /**
   * the storage path where the DataSet files can be found at the location.
   */
  path: string;

  /**
   * AWS Account ID of DataSet
   */
  awsAccountId?: string;

  /**
   * AWS region of the dataset storage
   */
  region?: string;

  /**
   * an instance of {@link DataSetsStoragePlugin} to provide the storage implementation
   * for a particular platform, account, etc.
   */
  storageProvider: DataSetsStoragePlugin;

  /** the intial permissions to set on the dataset. */
  permissions?: DataSetPermission[];

  /** the user requesting the action */
  authenticatedUser: {
    id: string;
    roles: string[];
  };
}
