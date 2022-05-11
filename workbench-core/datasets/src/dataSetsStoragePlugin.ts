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
}
