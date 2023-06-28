/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface EndpointConnectionStrings {
  /**
   * a URL which can be used to access the storage endpoint.
   */
  endPointUrl: string;

  /**
   * An alias which also can be used to access the storage endpoint.
   */
  endPointAlias: string;
}
