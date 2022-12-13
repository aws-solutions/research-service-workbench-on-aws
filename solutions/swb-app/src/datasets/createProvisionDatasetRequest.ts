/**
 * This interface represents a contract consumed by the DataSets service to interact
 * with an underlying stroage provider. This interface should be implemented for each
 * underlying storage mechanism used for providing DataSets item storage.
 */
import { DataSetsStoragePluginInterface } from './dataSetsStoragePluginInterface';

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
  storageProvider: DataSetsStoragePluginInterface;
}
