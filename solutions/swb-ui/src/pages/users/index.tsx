/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  Button,
  Header,
  SpaceBetween,
  Table,
  StatusIndicator
} from '@awsui/components-react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useUsers } from '../../api/users';
import { layoutLabels } from '../../common/labels';
import Navigation from '../../components/Navigation';
import RouteGuard from '../../components/RouteGuard';
import { useSettings } from '../../context/SettingsContext';
import styles from '../../styles/BaseLayout.module.scss';
import { columnDefinitions } from '../../users-table-config/usersColumnDefinitions';

export interface UserProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: UserProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

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
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <AppLayout
      id="users-layout"
      className={styles.baseLayout}
      headerSelector="#header"
      stickyNotifications
      toolsHide
      ariaLabels={layoutLabels}
      navigationOpen={navigationOpen}
      navigation={<Navigation activeHref="/users" />}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
      }
      contentType="table"
      onNavigationChange={({ detail }) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        setNavigationOpen(detail.open);
        navigationOpen = true;
      }}
      content={
        <RouteGuard>
          <Box margin={{ bottom: 'l' }}>
            <Head>
              <title>{settings.name}</title>
              <link rel="icon" href={settings.favicon} />
            </Head>
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
        </RouteGuard>
      }
    ></AppLayout>
  );
};

export default User;
