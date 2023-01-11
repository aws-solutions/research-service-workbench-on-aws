/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export default interface EnvironmentLifecycleService {
  /**
   * Launching an instance
   *
   * Return: DDB Env id
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  launch(envMetadata: any): Promise<{ [id: string]: string }>;

  /**
   * Terminate an instance
   */
  terminate(id: string): Promise<{ [id: string]: string }>;

  /**
   * Start an instance
   */
  start(id: string): Promise<{ [id: string]: string }>;

  /**
   * Stop an instance
   */
  stop(id: string): Promise<{ [id: string]: string }>;
}
