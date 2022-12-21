/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../authenticatedUser';
import { DynamicOperation } from './dynamicOperation';

/**
 * Request object for IsAuthorizedOnSubjectRequest
 */
export interface IsAuthorizedOnSubjectRequest {
  /**
   * {@link AuthenticatedUser}
   */
  user: AuthenticatedUser;
  /**
   * {@link DynamicOperation}
   */
  dynamicOperation: DynamicOperation;
}
