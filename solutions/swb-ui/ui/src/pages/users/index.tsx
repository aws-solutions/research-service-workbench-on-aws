/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useUsers, BaseLayout, useSettings } from '@aws/workbench-core-swb-common-ui';
import {
  Box,
  BreadcrumbGroupProps,
  Button,
  Header,
  SpaceBetween,
  Table,
  StatusIndicator
} from '@cloudscape-design/components';
import type { NextPage } from 'next';
import { useState } from 'react';
import { columnDefinitions } from '../../users-table-config/usersColumnDefinitions';

export interface UserProps {
  locale: string;
}

const User: NextPage = () => {
  // App settings constant
  const { settings } = useSettings();
  const { users, mutate } = useUsers();
  const [error, setError] = useState('');

  // App layout constants
  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Users',
      href: '/users'
    }
  ];

  const getContent = (): JSX.Element => {
    return (
      <Box margin={{ bottom: 'l' }}>
        {!!error && <StatusIndicator type="error">{error}</StatusIndicator>}
        <Table
          header={
            <>
              <Header
                actions={
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button variant="primary" href="/users/new">
                        Create Researcher
                      </Button>
                    </SpaceBetween>
                  </Box>
                }
              >
                Users
              </Header>
            </>
          }
          columnDefinitions={columnDefinitions}
          loadingText="Loading users"
          items={users}
        />
      </Box>
    );
  };
  return (
    <BaseLayout breadcrumbs={breadcrumbs} activeHref="/users">
      {getContent()}
    </BaseLayout>
  );
};

export default User;
