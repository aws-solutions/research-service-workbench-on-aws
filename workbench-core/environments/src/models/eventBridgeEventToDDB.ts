/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export default interface EventBridgeEventToDDB {
  envId?: string;
  instanceId?: string;
  status: string;
  errorMsg?: string;
  operation?: string;
  recordOutputKeys?: { instanceName: string; instanceArn: string; instanceRoleName: string };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  metadata?: any;
}
