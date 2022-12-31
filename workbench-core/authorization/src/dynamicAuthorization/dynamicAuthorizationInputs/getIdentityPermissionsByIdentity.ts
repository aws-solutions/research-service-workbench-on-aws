/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { IdentityPermission, IdentityTypeParser } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const GetIdentityPermissionsByIdentityRequestParser = z
  .object({
    /**
     * {@link IdentityType}
     */
    identityType: IdentityTypeParser,
    /**
     * Identity id associated to the {@link IdentityPermission}s
     */
    identityId: z.string()
  })
  .strict();
/**
 * Request object for GetIdentityPermissionsByIdentity
 */
export type GetIdentityPermissionsByIdentityRequest = z.infer<
  typeof GetIdentityPermissionsByIdentityRequestParser
>;

/**
 * Response object for GetIdentityPermissionsByIdentity
 */
export interface GetIdentityPermissionsByIdentityResponse {
  data: {
    /**
     * An array of {@link IdentityPermission} associated to the identity
     */
    identityPermissions: IdentityPermission[];
  };
}
