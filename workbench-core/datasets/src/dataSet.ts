export interface DataSet {
  /**
   * the name of a DataSet
   */
  name: string;

  /**
   * the date and time at which the DataSet was added to the solution.
   */
  createdAt: Date;

  /**
   * the storage path where the DataSet files can be found at the location.
   */
  path: string;
}
