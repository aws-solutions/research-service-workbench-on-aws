import { BreadcrumbGroupProps } from '@awsui/components-react';
import AppLayout, { AppLayoutProps } from '@awsui/components-react/app-layout';
import BreadcrumbGroup from '@awsui/components-react/breadcrumb-group';
import Flashbar from '@awsui/components-react/flashbar';
import { useState } from 'react';
import { layoutLabels } from '../common/labels';
import Navigation from '../components/Navigation';
import { useNotifications } from '../context/NotificationContext';

export interface LayoutProps {
  navigationHide?: boolean;
  children: React.ReactNode;
  breadcrumbs: BreadcrumbGroupProps.Item[];
}

export default function Layout({ navigationHide, children, breadcrumbs }: LayoutProps): JSX.Element {
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);
  const { notifications, displayNotification } = useNotifications();
  const id = 'BetaCodeWarning';
  displayNotification(id, {
    type: 'warning',
    dismissible: false,
    content:
      'This software is in active development/testing mode. Do not put any critical, production, or otherwise important data in workspaces or studies.'
  });

  const appLayoutLabels: AppLayoutProps.Labels = layoutLabels;
  return (
    <AppLayout
      id="app-layout"
      headerSelector="#header"
      stickyNotifications
      toolsHide
      ariaLabels={appLayoutLabels}
      navigationOpen={navigationOpen}
      navigationHide={navigationHide}
      navigation={<Navigation activeHref="#/" />}
      notifications={<Flashbar items={Object.values(notifications)} />}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
      }
      contentType="table"
      content={children}
      onNavigationChange={({ detail }) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        setNavigationOpen(detail.open);
        navigationOpen = true;
      }}
    />
  );
}
