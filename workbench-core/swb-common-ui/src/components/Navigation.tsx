/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import * as React from 'react';
import { useAuthentication } from '../context/AuthenticationContext';
import RouteGuard from './RouteGuard';

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
  const defaultNavHeader: SideNavigationProps.Header = {
    text: 'Service Workbench',
    href: '#/'
  };
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: 'Users', href: '/users' },
    { type: 'link', text: 'Workspaces', href: '/environments' },
    { type: 'link', text: 'Datasets', href: '/datasets' }
  ];
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: 'Workspaces', href: '/environments' },
    { type: 'link', text: 'Datasets', href: '/datasets' }
  ];

  // Role-based navigation display
  const { user } = useAuthentication();
  const userRole = user ? user.role : 'researcher';
  let navDisplay: typeof adminNavItems | typeof userNavItems = adminNavItems;
  if (userRole === 'ITAdmin') {
    navDisplay = adminNavItems;
  } else {
    navDisplay = userNavItems;
  }

  return (
    <RouteGuard>
      <SideNavigation
        data-testid="sideNavigation"
        activeHref={activeHref}
        header={header ? header : defaultNavHeader}
        items={items ? items : navDisplay}
        onFollow={onFollowHandler}
      />
    </RouteGuard>
  );
}
