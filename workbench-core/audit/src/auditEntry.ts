/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * An interface containing the necessary values for an audit entry.
 */
export default interface AuditEntry {
  [key: string]: string | object | number | undefined;
  /**
   * When in a log group, this is used differentiate the audit entry.
   */
  logEventType?: string;
  /**
   * The body for the audit entry
   */
  body?: object;
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
