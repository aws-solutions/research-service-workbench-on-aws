/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface DataSet {
  /**
   * an internally generated value which uniquely identifies the dataset.
   */
  id: string;

  /**
   * the name of a DataSet
   */
  name: string;

  /**
   * the date and time string at which the DataSet was added to the solution.
   */
  createdAt: string;

  /**
   * (optional) a description of the dataset
   */
  description?: string;

  /**
   * (optional) the owner of the dataset
   */
  owner?: string;

  /**
   * (optional) the type of the dataset
   */
  type?: string;

  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  storageName: string;

  /**
   * Storage Type of the DataSet
   */
  storageType: string;

  /**
   * the storage path where the DataSet files can be found at the location.
   */
  path: string;

  /**
   * the Ids endpoints through which the dataset is accessible.
   */
  externalEndpoints?: string[];

  /**
   * AWS Account ID of DataSet
   */
  awsAccountId?: string;

  /**
   * AWS region of the dataset storage
   */
  region?: string;
}
