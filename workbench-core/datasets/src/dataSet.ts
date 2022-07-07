export interface DataSet {
  [key: string]: string | string[] | undefined;
  /**
   * an internally generated value which uniquely identifies the dataset.
   */
  id?: string;

  /**
   * the name of a DataSet
   */
  name: string;

  /**
   * the date and time string at which the DataSet was added to the solution.
   */
  createdAt?: string;

  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  storageName: string;

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
   * Storage Type of the DataSet
   */
  storageType?: string;
}
