/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSet, ExternalEndpoint } from '.';

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
   * @param id - the ID of the DataSet for which to get the metadata.
   *
   * @returns the metadata associated with the overall DataSet.
   */
  getDataSetMetadata(id: string): Promise<DataSet>;

  /**
   * Get a list of objects in the DataSet as stored in the backend.
   *
   * @param dataSetId - the ID of the DataSet for which the objects are to be returned.
   *
   * @returns a list of objects in a DataSet.
   */
  listDataSetObjects(dataSetId: string): Promise<string[]>;

  /**
   * Get the metadata associated with a given object in a given DataSet.
   *
   * @param dataSetId - the ID of the DataSet which contains the object.
   * @param objectId - the ID of the object.
   *
   * @returns the metadata associated with the object.
   */
  getDataSetObjectMetadata(dataSetId: string, objectId: string): Promise<Record<string, string>>;

  /**
   * Add a DataSet to the solution.
   * @param dataSet - the DataSet to add.
   *
   * @returns the DataSet object added to the database.
   */
  addDataSet(dataSet: DataSet): Promise<DataSet>;

  /**
   * Update a DataSet
   * @param dataSet - the updated DataSet data.
   *
   * @returns the updated DataSet object.
   */
  updateDataSet(dataSet: DataSet): Promise<DataSet>;

  /**
   * Return the details on a specific DataSet endpoint.
   *
   * @param dataSetId - the Id of the DataSet for which the endpoint data is to be returned.
   * @param endPointId - the Id of the endpoint for which details are to be returned.
   *
   * @returns details about the specified endpoint.
   */
  getDataSetEndPointDetails(dataSetId: string, endPointId: string): Promise<ExternalEndpoint>;

  /**
   * Add an external endpoint to a DataSet.
   * @param endPoint - the details of the endpoint to add.
   *
   * @returns the details of the endpoint added.
   */
  addExternalEndpoint(endPoint: ExternalEndpoint): Promise<ExternalEndpoint>;

  /**
   * Get the endpoint details for a given DataSet.
   *
   * @param dataSetId - the ID of the Dataset for which endpoints are to be returned.
   *
   * @returns an array of ExternalEndpoint objects.
   */
  listEndpointsForDataSet(dataSetId: string): Promise<ExternalEndpoint[]>;

  /**
   * Update an external endpoint with the given data.
   *
   * @param endPoint - the details of the endpoint to update.
   *
   * @returns the updated details of the Endpoint.
   */
  updateExternalEndpoint(endPoint: ExternalEndpoint): Promise<ExternalEndpoint>;
}
