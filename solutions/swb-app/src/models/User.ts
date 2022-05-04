import { IconProps } from '@awsui/components-react/icon';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: IconProps;
  claims: string[];
  role: string;
}

export const researcherUser: User = {
  id: 'sample-researcher-id',
  name: 'Researcher User',
  email: 'sample.user@amazon.com',
  avatar: { name: 'user-profile' },
  claims: [],
  role: 'researcher'
};

export const adminUser: User = {
  id: 'sample-admin-id',
  name: 'Admin User',
  email: 'sample.user@amazon.com',
  avatar: { name: 'user-profile' },
  claims: [],
  role: 'admin'
};
