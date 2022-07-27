/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BreadcrumbGroupProps } from '@awsui/components-react';
import Box from '@awsui/components-react/box';
import type { NextPage } from 'next';
import Head from 'next/head';
import BaseLayout from '../components/BaseLayout';
import Hero from '../components/Hero';
import { useSettings } from '../context/SettingsContext';

// Login Page
const Home: NextPage = () => {
  const { settings } = useSettings();
  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    {
      text: 'Service Workbench',
      href: '#'
    },
    {
      text: 'Login',
      href: '#'
    }
  ];

  return (
    <BaseLayout breadcrumbs={breadcrumbs} navigationHide>
      <Box margin={{ bottom: 'l' }}>
        <Hero />
      </Box>
    </BaseLayout>
  );
};

export default Home;
