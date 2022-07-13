import SideNavigation, { SideNavigationProps } from '@awsui/components-react/side-navigation';
import { useTranslation } from 'next-i18next';
import React from 'react';
// import { User, researcherUser } from '../models/User';

export interface NavigationProps {
  activeHref?: string;
  header?: SideNavigationProps.Header;
  items?: ReadonlyArray<SideNavigationProps.Item>;
  onFollowHandler?: (ev: CustomEvent<SideNavigationProps.FollowDetail>) => void;
}

export default function Navigation({
  activeHref,
  header,
  items,
  onFollowHandler
}: NavigationProps): JSX.Element {
  const { t } = useTranslation();
  const defaultNavHeader: SideNavigationProps.Header = {
    text: 'Service Workbench',
    href: '#/'
  };
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: t('Users'), href: '/users' },
    { type: 'link', text: t('Workspaces'), href: '/environments' },
    { type: 'link', text: t('Datasets'), href: '/datasets' }
  ];
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: t('Workspaces'), href: '/environments' },
    { type: 'link', text: t('Datasets'), href: '/datasets' }
  ];

  // Role-based navigation display
  // const user: User = researcherUser;
  // const userRole: string = user.role;
  const navDisplay: typeof adminNavItems | typeof userNavItems = adminNavItems;
  // if (userRole === 'admin') {
  //   navDisplay = adminNavItems;
  // } else {
  //   navDisplay = userNavItems;
  // }
  // navDisplay = userNavItems;
  // Role-based navigation state
  // const activeNav: typeof activeHref = '/environments';
  // if (userRole === 'admin') {
  //   activeNav = '/dashboards';
  // } else {
  //   activeNav = '/environments';
  // }
  // activeNav = '/environments';

  return (
    <SideNavigation
      activeHref={activeHref}
      header={header ? header : defaultNavHeader}
      items={items ? items : navDisplay}
      onFollow={onFollowHandler}
    />
  );
}
