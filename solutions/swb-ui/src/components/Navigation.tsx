import SideNavigation, { SideNavigationProps } from '@awsui/components-react/side-navigation';
import React from 'react';
import { User, researcherUser } from '../models/User';

export interface NavigationProps {
  activeHref?: string;
  header?: SideNavigationProps.Header;
  items?: ReadonlyArray<SideNavigationProps.Item>;
}

export default function Navigation({ items }: NavigationProps): JSX.Element {
  const [activeHref, setActiveHref] = React.useState('');
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    {
      type: 'section',
      text: 'Dashboards',
      items: [
        { type: 'link', text: 'All Dashboards', href: '/dashboards' },
        { type: 'link', text: 'Project Dashboards', href: '/dashboards#projects' }
      ]
    },
    { type: 'link', text: 'Users', href: '/users' },
    { type: 'link', text: 'Workspaces', href: '/environments' },
    { type: 'link', text: 'Datasets', href: '/datasets' }
  ];
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: 'Workspaces', href: '/environments' },
    { type: 'link', text: 'Datasets', href: '/datasets' },
    {
      type: 'section',
      text: 'Dashboards',
      items: [
        { type: 'link', text: 'All Dashboards', href: '/dashboards' },
        { type: 'link', text: 'Project Dashboards', href: '/dashboards#projects' }
      ]
    }
  ];

  // Role-based navigation display
  const user: User = researcherUser;
  const userRole: string = user.role;
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
