/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface EndpointConnectionStrings {
  /**
   * a URL which can be used to access the storage endpoint.
   */
  endPointUrl: string;

  /**
   * An optional alias which also can be used to access the storage endpoint.
   */
  endPointAlias?: string;
}

/**
 * This interface represents a contract consumed by the DataSets service to interact
 * with an underlying stroage provider. This interface should be implemented for each
 * underlying storage mechanism used for providing DataSets item storage.
 */
export interface DataSetsStoragePlugin {
  /**
   * Returns a constient identifier for the type of storage associated with the plugin.
   * This value should be unique for each storage plugin type.
   */
  getStorageType(): string;

  /**
   * Create a storage destination for a dataSet.
   *
   * @param name - A name identifying the stroage destination. This should be consistent
   * with the naming rules for the underlying storage mechanism for which the
   * interface is implemented.
   * @param path - the storage specifc path for the destination.
   *
   * @returns a URL to access the new storage location.
   */
  createStorage(name: string, path: string): Promise<string>;

  /**
   * Complete any operations needed in the storage provider to import an existing
   * location as a DataSet.
   * @param name - A name identifying the storage destination.
   * @param path - the storage specific path for the destination.
   *
   * @returns a URL to access the storage location.
   */
  importStorage(name: string, path: string): Promise<string>;

  /**
   * Configures an existing dataset to be connected to an external environment.
   *
   * @param name - the name of the storage destination to be accessed
   * @param path - a string which locates to root of the dataset within the storage medium
   * such as a prefix in an S3 bucket.
   * @param externalEndpointName - a name to uniquely identify the endpoint.
   * @param ownerAccountId - the AWS Account Id where the storage resides.
   * @param externalRoleName - an optional role name which the external environment will assume to
   * access the DataSet
   *
   * @returns an object containing the endpoint's URL and an optional alias which can be used to find the endpoint.
   */
  addExternalEndpoint(
    name: string,
    path: string,
    externalEndpointName: string,
    ownerAccountId: string,
    externalRoleName?: string
  ): Promise<EndpointConnectionStrings>;

  /**
   * Removes an existing dataset connection which was used for access by an external environment
   *
   * @param name - the name of the storage destination
   * @param externalEndpointName - a name to uniquely identify the endpoint.
   * @param ownerAccountId - the owning AWS account for the storage destination.
   */
  removeExternalEndpoint(externalEndpointName: string, ownerAccountId: string): Promise<void>;

  /**
   * Add a role used to access an external endpoint.
   * If provided, update the policy on the KMS key to grant
   * encrypt/decrypt access for the given role.
   *
   * @param name - the name of the storage destination accessed by the external endpoint.
   * @param externalEndpointName - a name which uniquely identifies the external endpoint.
   * @param externalRoleName - the name of the role which will replace the current role accessing the endpoint.
   * @param endPointUrl - a URL which can be used to reach the endpoint.
   * @param kmsKeyArn - an optional Arn which identifies a KMS key used to encrypt/decrypt data in the storage location.
   * @returns a string which can be used to mount the Dataset to an external environment.
   */
  addRoleToExternalEndpoint(
    name: string,
    path: string,
    externalEndpointName: string,
    externalRoleName: string,
    endPointUrl: string,
    kmsKeyArn?: string
  ): Promise<void>;

  /**
   * Remove a role from an external endpoint.
   * @param name - the name of the storage destination accessed by the external endpoint.
   * @param externalEndpointName - the name which uniquely identifies the external endpoint.
   * @param externalRoleArn - the arn of the role to remove from the endpoint.
   */
  removeRoleFromExternalEndpoint(
    name: string,
    externalEndpointName: string,
    externalRoleArn: string
  ): Promise<void>;

  /**
   *
   * @param name - the name of the DataSet which will be mounted to the environment.
   * @param externalEndpointName - the unique name used to identify the endpont.
   *
   * @returns a string which can be used to mount the Dataset to an external environment.
   */
  // getExternalEndpoint(name: string, externalEndpointName: string): Promise<string>;

  /**
   * Create a presigned URL to be used to upload a file to a Dataset.
   *
   * @param name - the name of the Dataset to which to make an upload.
   * @param timeToLiveMilliseconds - the maximum time before the URL expires.
   *
   * @returns a URL which can be used to upload a file directly to the DataSet destination.
   */
  createPresignedUploadUrl(name: string, timeToLiveMilliseconds: number): Promise<string>;

  /**
   * Create a set of presigned URLs to be used to make a multipart upload to a DataSet.
   *
   * @param name - the DataSet to which files will be uploaded.
   * @param numberOfParts - the number of parts in which the file will be divided.
   * @param timeToLiveMilliseconds - the length of time in milliseconds for which the URLs will be valid.
   *
   * @returns an Array of presigned Urls. The first iniates the upload. The last completes it. All in between represent the parts
   * of the upload.
   */
  createPresignedMultiPartUploadUrls(
    name: string,
    numberOfParts: number,
    timeToLiveMilliseconds: number
  ): Promise<string[]>;
}
