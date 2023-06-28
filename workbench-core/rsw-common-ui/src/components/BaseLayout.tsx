/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BreadcrumbGroupProps } from '@cloudscape-design/components';
import AppLayout, { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Flashbar from '@cloudscape-design/components/flashbar';
import Head from 'next/head';
import * as React from 'react';
import { layoutLabels } from '../common/labels';
import Navigation from '../components/Navigation';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';

export interface LayoutProps {
  navigationHide?: boolean;
  children: React.ReactNode;
  breadcrumbs: BreadcrumbGroupProps.Item[];
  activeHref?: string;
}

export default function BaseLayout({
  navigationHide,
  children,
  breadcrumbs,
  activeHref = '#/'
}: LayoutProps): JSX.Element {
  const [navigationOpen, setNavigationOpen] = React.useState(false);
  const { notifications, displayNotification } = useNotifications();
  const id = 'BetaCodeWarning';
  displayNotification(id, {
    type: 'warning',
    dismissible: false,
    content:
      'This software is in active development/testing mode. Do not put any critical, production, or otherwise important data in workspaces or studies.'
  });

  const { settings } = useSettings();
  const appLayoutLabels: AppLayoutProps.Labels = layoutLabels;
  return (
    <>
      <Head>
        <title>{settings.name}</title>
        <meta name="description" content={settings.description} />
        <link rel="icon" href={settings.favicon} />
      </Head>
      <AppLayout
        id="app-layout"
        headerSelector="#header"
        stickyNotifications
        toolsHide
        ariaLabels={appLayoutLabels}
        navigationOpen={navigationOpen}
        navigationHide={navigationHide}
        navigation={<Navigation activeHref={activeHref} />}
        notifications={<Flashbar items={Object.values(notifications)} />}
        breadcrumbs={
          <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
        }
        contentType="table"
        content={children}
        onNavigationChange={({ detail }) => {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          setNavigationOpen(detail.open);
        }}
      />
    </>
  );
}
