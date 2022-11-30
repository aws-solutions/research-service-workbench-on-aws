/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Request object for DynamicPermissionsPlugin's deleteSubjectPermissions
 */
export interface DeleteSubjectPermissionsRequest {
  /**
   * The subject type to be deleted
   */
  subjectType: string;

  /**
   * The subject id associated to the subject to be deleted
   */
  subjectId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's deleteSubjectPermissions
 */
export interface DeleteSubjectPermissionsResponse {
  /**
   * States whether all the subject's permissions were successfully created
   */
  deleted: boolean;
}
