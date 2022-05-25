/**
 * This interface represents a contract consumed by the DataSets service to interact
 * with an underlying stroage provider. This interface should be implemented for each
 * underlying storage mechanism used for providing DataSets item storage.
 */
export interface DataSetsStoragePlugin {
  /**
   * Create a storage destination for a dataSet.
   *
   * @param name - A name identifying the stroage destination. This should be consistent
   * with the naming rules for the underlying storage mechanism for which the
   * interface is implemented.
   * @param additionalParams - An array of additional parameters needed by the underlying
   * stroage mechanism to complete the operation.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createStorage(name: string, ...additionalParams: any[]): Promise<string>;

  /**
   * Configures an existing dataset to be connected to an external environment.
   *
   * @param dataSetName - the name of the dataSet to be accessed
   * @param externalEndpointName - a name to uniquely identify the endpoint.
   * @param externalRoleName - the role name which the external environment will assume to
   * access the DataSet
   * @returns a string which can be used to mount the DataSet to an external environment.
   */
  addExternalEndpoint(
    dataSetName: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string>;

  /**
   * Changes the role used to access an external endpoint.
   *
   * @param dataSetName - the name of the dataSet accessed by the external endpoint.
   * @param externalEndpointName - a name which uniquely identifies the external endpoint.
   * @param externalRoleName - the name of the role which will replace the current role accessing the endpoint.
   * @returns a string which can be used to mount the Dataset to an external environment.
   */
  updateExternalEndpoint(
    dataSetName: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string>;

  /**
   *
   * @param dataSetName - the name of the DataSet which will be mounted to the environment.
   * @param externalEndpointName - the unique name used to identify the endpont.
   */
  getExternalEndpoint(dataSetName: string, externalEndpointName: string): Promise<string>;

  /**
   * Create a presigned URL to be used to upload a file to a Dataset.
   *
   * @param dataSetName - the name of the Dataset to which to make an upload.
   * @param timeToLiveMilliseconds - the maximum time before the URL expires.
   */
  createPresignedUploadUrl(dataSetName: string, timeToLiveMilliseconds: number): Promise<string>;
  /**
   * Create a set of presigned URLs to be used to make a multipart upload to a DataSet.
   *
   * @param storageLocation - the DataSet to which files will be uploaded.
   * @param numberOfParts - the number of parts in which the file will be divided.
   * @param timeToLiveMilliseconds - the length of time in milliseconds for which the URLs will be valid.
   * @returns an Array of presigned Urls. The first iniates the upload. The last completes it. All in between represent the parts
   * of the upload.
   */
  createPresignedMultiPartUploadUrls(
    dataSetName: string,
    numberOfParts: number,
    timeToLiveMilliseconds: number
  ): Promise<string[]>;
}
