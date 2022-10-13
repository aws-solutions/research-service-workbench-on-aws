export interface StorageLocation {
  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  name: string;

  /**
   * storage type of the StorageLocation
   */
  type: string;

  /**
   * AWS Account ID of the StorageLocation
   */
  awsAccountId?: string;

  /**
   * AWS region of the StorageLocation
   */
  region?: string;
}
