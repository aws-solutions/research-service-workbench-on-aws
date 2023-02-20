/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { IconProps } from '@cloudscape-design/components/icon';

export interface UserItem {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
  avatar?: IconProps;
  claims?: string[];
  role?: string;
}

export const researcherUser: UserItem = {
  id: 'sample-researcher-id',
  givenName: 'Researcher',
  familyName: 'User',
  email: 'sample.user@example.com',
  avatar: { name: 'user-profile' },
  claims: [],
  role: 'researcher'
};

export const adminUser: UserItem = {
  id: 'sample-admin-id',
  givenName: 'ITAdmin',
  familyName: 'User',
  email: 'sample.user@example.com',
  avatar: { name: 'user-profile' },
  claims: [],
  role: 'ITAdmin'
};

export interface CreateUserForm {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserFormValidation {
  emailError?: string;
  familyNameError?: string;
  givenNameError?: string;
}
