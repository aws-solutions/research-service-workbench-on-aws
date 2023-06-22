/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

/**
 * An enum defining the status of a user
 */
export enum Status {
  INACTIVE,
  ACTIVE
}

/**
 * A record to represent a user.
 */
export interface User {
  /**
   * A unique identifier for the user.
   */
  id: string;

  /**
   * The user's first name.
   */
  firstName: string;

  /**
   * The user's last name.
   */
  lastName: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's {@link Status}
   */
  status: Status;

  /**
   * The roles to which the user belongs.
   */
  roles: string[];
}

export const UserZod: z.ZodType<User> = z.object({
  /**
   * A unique identifier for the user.
   */
  id: z.string(),

  /**
   * The user's first name.
   */
  firstName: z.string(),

  /**
   * The user's last name.
   */
  lastName: z.string(),

  /**
   * The user's email address.
   */
  email: z.string(),

  /**
   * The user's {@link Status}
   */
  status: z.nativeEnum(Status),

  /**
   * The roles to which the user belongs.
   */
  roles: z.array(z.string())
});

/**
 * A record to represent a user to create.
 */
export interface CreateUser {
  /**
   * The user's first name.
   */
  firstName: string;

  /**
   * The user's last name.
   */
  lastName: string;

  /**
   * The user's email address.
   */
  email: string;
}
