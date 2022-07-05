export interface ExternalEndpoint {
  [key: string]: string | string[] | undefined;

  /**
   * The endpoint's unique identifier.
   */
  id?: string;

  /**
   * The name of the endpoint. This is to be unique within a DataSet.
   */
  name: string;

  /**
   * The time at which the endpoint was created.
   */
  createdAt?: string;

  /**
   * The identifier of the DataSet for which the endpoint was created.
   */
  dataSetId: string;

  /**
   * The name of the DataSet for which the endpoint was created.
   */
  dataSetName: string;

  /**
   * The path to the objects(files) in the DataSet storage for this endpoint.
   */
  path: string;

  /**
   * A list of role ARNs for which access has been granted for this endpoint.
   */
  allowedRoles?: string[];

  /**
   * The S3 URL to reach this endpoint.
   */
  endPointUrl: string;
}
