/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import useSWR from 'swr';
import { CreateUserForm } from '../models/User';
import { httpApiGet, httpApiPost, httpApiPut } from './apiHelper';

const addUserToRole = async (username: string, role: string): Promise<void> => {
  await httpApiPut(`/roles/${role}`, { username: username });
};

const createUser = async (createUserForm: CreateUserForm): Promise<void> => {
  console.log(createUserForm);
  await httpApiPost(`users`, { ...createUserForm });
};

const useUsers = () => {
  const { data, mutate } = useSWR('users', httpApiGet, {});

  const users = (data && data.users) || [];
  return { users, mutate };
};

export { addUserToRole, createUser, useUsers };
