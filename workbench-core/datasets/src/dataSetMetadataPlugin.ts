/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
import { CreateDataSet, DataSet } from './models/dataSet';
import { CreateExternalEndpoint, ExternalEndpoint } from './models/externalEndpoint';
import { StorageLocation } from './models/storageLocation';

export interface DataSetMetadataPlugin {
  /**
   * Calculates the pagination token based on the DataSet id
   * @param dataSetId - the dataSetId
   *
   * @returns the pagination token for this item.
   */
  getPaginationToken(dataSetId: string): string;

  /**
   * Lists the DataSets in the database backend.
   *
   * @returns an array of DataSets.
   */
  listDataSets(pageSize: number, paginationToken: string | undefined): Promise<PaginatedResponse<DataSet>>;

  /**
   * Gets the metadata associated with an overall dataset. This differs from
   * object/file Metadata. For that, use {@link getDataSetObjectMetadata}.
   *
   * @param id - the ID of the DataSet for which to get the metadata.
   *
   * @returns the metadata associated with the overall DataSet.
   *
   * @throws {@link DataSetNotFoundError} - the dataset doesnt exist
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
  addDataSet(dataSet: CreateDataSet): Promise<DataSet>;

  /**
   * Update a DataSet
   * @param dataSet - the updated DataSet data.
   *
   * @returns the updated DataSet object.
   */
  updateDataSet(dataSet: DataSet): Promise<DataSet>;

  /**
   * Remove a DataSet
   * @param dataSetId - the ID of the Dataset to remove.
   */
  removeDataSet(dataSetId: string): Promise<void>;

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
   *
   * @throws {@link EndpointExistsError} - the endpoint already exists
   */
  addExternalEndpoint(endPoint: CreateExternalEndpoint): Promise<ExternalEndpoint>;

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

  /**
   * Lists the {@link StorageLocation}s being used by existing datasets.
   *
   * @returns - a list of {@link StorageLocation}s
   */
  listStorageLocations(
    pageSize: number,
    paginationToken: string | undefined
  ): Promise<PaginatedResponse<StorageLocation>>;
}
