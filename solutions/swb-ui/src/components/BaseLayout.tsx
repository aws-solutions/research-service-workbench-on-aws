import { BreadcrumbGroupProps } from '@awsui/components-react';
import AppLayout, { AppLayoutProps } from '@awsui/components-react/app-layout';
import BreadcrumbGroup from '@awsui/components-react/breadcrumb-group';
import Flashbar from '@awsui/components-react/flashbar';
import { useState } from 'react';
import { layoutLabels } from '../common/labels';
import Navigation from '../components/Navigation';
import { useNotifications } from '../context/NotificationContext';
import styles from '../styles/BaseLayout.module.scss';

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

export interface LayoutProps {
  navigationHide?: boolean;
  appName?: string;
  children: React.ReactNode;
}

export default function Layout({ navigationHide, appName, children }: LayoutProps): JSX.Element {
  // eslint-disable-next-line prefer-const
  let [navigationOpen, setNavigationOpen] = useState(false);
  const { notifications } = useNotifications();

  const appLayoutLabels: AppLayoutProps.Labels = layoutLabels;

  if (appName !== undefined) {
    breadcrumbs[1].text = appName;
  }

  return (
    <AppLayout
      id="app-layout"
      className={styles.baseLayout}
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
