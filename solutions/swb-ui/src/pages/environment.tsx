/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  StatusIndicator
} from '@awsui/components-react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useState } from 'react';
import { layoutLabels } from '../common/labels';
import Navigation from '../components/Navigation';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/BaseLayout.module.scss';

export interface EnvironmentProps {
  locale: string;
}

export const getServerSideProps = async ({ locale }: EnvironmentProps): Promise<unknown> => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
});

const Environment: NextPage = () => {
  // For functions to return content specific to the table
  const itemType: string = 'workspace';
  // App settings constant
  const { settings } = useSettings();
  const [preferences] = useState({
    pageSize: 20
  });

  const [error, setError] = useState('');

  // App layout constants
  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '/'
    },
    {
      text: 'Workspaces',
      href: '/environments'
    },
    {
      text: 'Create Workspace',
      href: '/environment'
    }
  ];
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <AppLayout
      id="environments-layout"
      className={styles.baseLayout}
      headerSelector="#header"
      stickyNotifications
      toolsHide
      ariaLabels={layoutLabels}
      navigationOpen={navigationOpen}
      navigation={<Navigation activeHref="#/" />}
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
        <Box margin={{ bottom: 'l' }}>
          <Head>
            <title>{settings.name}</title>
            <link rel="icon" href={settings.favicon} />
          </Head>
          {!!error && <StatusIndicator type="error">{error}</StatusIndicator>}
        </Box>
      }
    ></AppLayout>
  );
};

export default Environment;
