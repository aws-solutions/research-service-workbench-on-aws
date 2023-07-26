/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Operation, Permission } from '..';

export const mockAdminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Sample'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Sample'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Role'
  }
];

export const mockGuestPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Sample'
  }
];

export const mockPutOperations: Operation[] = [
  {
    action: 'UPDATE',
    subject: 'Sample'
  },
  {
    action: 'READ',
    subject: 'Sample'
  }
];
export const mockGetOperations: Operation[] = [
  {
    action: 'READ',
    subject: 'Sample'
  }
];
