import { useTranslation } from 'next-i18next';
import SideNavigation, { SideNavigationProps } from '@awsui/components-react/side-navigation';
import { User, adminUser, researcherUser } from '../models/User';
import React from 'react';
import { useAuthentication } from '../context/AuthenticationContext';

export interface NavigationProps {
  activeHref?: string;
  header?: SideNavigationProps.Header;
  items?: ReadonlyArray<SideNavigationProps.Item>;
}

export default function Navigation({ items }: NavigationProps): JSX.Element {
  const { t } = useTranslation();
  let [activeHref, setActiveHref] = React.useState('');
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    {
      type: 'section',
      text: t('Dashboards'),
      items: [
        { type: 'link', text: t('All Dashboards'), href: '/dashboards' },
        { type: 'link', text: t('Project Dashboards'), href: '/dashboards#projects' }
      ]
    },
    { type: 'link', text: t('Users'), href: '/users' },
    { type: 'link', text: t('Workspaces'), href: '/environments' },
    { type: 'link', text: t('Datasets'), href: '/datasets' }
  ];
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: t('Workspaces'), href: '/environments' },
    { type: 'link', text: t('Datasets'), href: '/datasets' },
    {
      type: 'section',
      text: t('Dashboards'),
      items: [
        { type: 'link', text: t('All Dashboards'), href: '/dashboards' },
        { type: 'link', text: t('Project Dashboards'), href: '/dashboards#projects' }
      ]
    }
  ];

  // Role-based navigation display
  // let user: User = adminUser;
  let user: User = researcherUser;
  let userRole: string = user.role;
  let navDisplay: typeof adminNavItems | typeof userNavItems;
  if (userRole === 'admin') {
    navDisplay = adminNavItems;
  } else {
    navDisplay = userNavItems;
  }
  // Role-based navigation state
  let activeNav: typeof activeHref;
  if (userRole === 'admin') {
    activeNav = '/dashboards';
  } else {
    activeNav = '/environments';
  }

  return (
    <SideNavigation
      activeHref={activeNav}
      items={items ? items : navDisplay}
      onFollow={(event) => {
        if (event.detail.external) {
          event.preventDefault();
          setActiveHref(event.detail.href);
        }
      }}
    />
  );
}
