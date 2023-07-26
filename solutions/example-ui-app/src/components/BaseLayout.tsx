/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BreadcrumbGroupProps } from '@awsui/components-react';
import AppLayout, { AppLayoutProps } from '@awsui/components-react/app-layout';
import BreadcrumbGroup from '@awsui/components-react/breadcrumb-group';
import Flashbar from '@awsui/components-react/flashbar';
import { useState } from 'react';
import Navigation from '../components/Navigation';
import { useNotifications } from '../context/NotificationContext';
import styles from '../styles/BaseLayout.module.scss';

const breadcrumbs: BreadcrumbGroupProps.Item[] = [
  {
    text: 'Service name',
    href: '#'
  },
  {
    text: 'Pages',
    href: '#'
  }
];

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { notifications } = useNotifications();

  const appLayoutLabels: AppLayoutProps.Labels = {
    navigation: 'Navigation drawer',
    navigationClose: 'Close navigation drawer',
    navigationToggle: 'Open navigation drawer',
    notifications: 'Notifications',
    tools: 'Help panel',
    toolsClose: 'Close help panel',
    toolsToggle: 'Open help panel'
  };
  return (
    <AppLayout
      id="app-layout"
      className={styles.baseLayout}
      headerSelector="#header"
      stickyNotifications
      toolsHide
      ariaLabels={appLayoutLabels}
      navigationOpen={navigationOpen}
      navigation={<Navigation activeHref="#/" />}
      notifications={<Flashbar items={Object.values(notifications)} />}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
      }
      contentType="table"
      content={children}
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
    />
  );
}
