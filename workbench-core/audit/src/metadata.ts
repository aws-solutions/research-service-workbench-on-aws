/**
 * Interface that enables metadata to be passed to the {@link AuditService}
 */
export default interface Metadata {
  [key: string]: string | object | number | boolean | undefined;
  /**
   * The status code of the request
   */
  statusCode?: number;
  /**
   * The requested action
   */
  action?: string;

  /**
   * The actor that is performing the action.
   */
  actor?: object;

  /**
   * The source of where the request is coming from.
   */
  source?: object;
}
