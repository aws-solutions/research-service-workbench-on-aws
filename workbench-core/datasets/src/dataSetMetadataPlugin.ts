import { DataSet } from '.';

export interface DataSetMetadataPlugin {
  /**
   * Lists the DataSets in the database backend.
   *
   * @returns an array of DataSets.
   */
  listDataSets(): Promise<DataSet[]>;

  /**
   * Gets the metadata associated with an overall dataset. This differs from
   * object/file Metadata. For that, use {@link getDataSetObjectMetadata}.
   *
   * @param name - the name of the DataSet for which to get the metadata.
   *
   * @returns the metadata associated with the overall DataSet.
   */
  getDataSetMetadata(name: string): Promise<Record<string, string | string[]>>;

  /**
   * Get a list of objects in the DataSet as stored in the backend.
   *
   * @param dataSetName - the name of the DataSet for which the objects are to be returned.
   *
   * @returns a list of objects in a DataSet.
   */
  listDataSetObjects(dataSetName: string): Promise<string[]>;

  /**
   * Get the metadata assoicated with a given object in a given DataSet.
   *
   * @param dataSetName - the name of the DataSet which contains the object.
   * @param objectName - the name of the object.
   *
   * @returns the metadata assoicated with the object.
   */
  getDataSetObjectMetadata(dataSetName: string, objectName: string): Promise<Record<string, string>>;
}
