/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../../models/authenticatedUser';
import { DynamicOperationParser } from './dynamicOperation';

// eslint-disable-next-line @rushstack/typedef-var
export const IsAuthorizedOnSubjectRequestParser = z.object({
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUserParser,
  /**
   * {@link DynamicOperation}
   */
  dynamicOperation: DynamicOperationParser
});

/**
 * Request object for IsAuthorizedOnSubjectRequest
 */
export type IsAuthorizedOnSubjectRequest = z.infer<typeof IsAuthorizedOnSubjectRequestParser>;
