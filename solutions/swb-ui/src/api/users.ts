import useSWR from 'swr';
import { CreateUserForm } from '../models/User';
import { httpApiGet, httpApiPost, httpApiPut } from './apiHelper';

const addUserToRole = async (username: string, role: string): Promise<void> => {
  await httpApiPut(`users/${username}/roles/${role}`, {});
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
