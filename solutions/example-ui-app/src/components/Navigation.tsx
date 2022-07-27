/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import SideNavigation, { SideNavigationProps } from '@awsui/components-react/side-navigation';
import { useTranslation } from 'next-i18next';

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
    text: t('Navigation.Administration'),
    href: '#/admin'
  };
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    {
      type: 'section',
      text: t('Navigation.Dashboards'),
      items: [
        { type: 'link', text: t('Navigation.ManageDashboards'), href: '#/admin/dashboards' },
        { type: 'link', text: t('Navigation.CreateDashboard'), href: '#/admin/dashboard/create' },
        { type: 'link', text: t('Navigation.ViewPublishedDashboards'), href: '#/' }
      ]
    },
    {
      type: 'section',
      text: t('Navigation.Users'),
      items: [
        { type: 'link', text: t('Navigation.ManageUsers'), href: '#/admin/users' },
        { type: 'link', text: t('Navigation.InviteUsers'), href: '#/admin/users/invite' }
      ]
    }
  ];
  const defaultOnFollowHandler = (ev: CustomEvent): void => {
    // keep the locked href for our demo pages
    ev.preventDefault();
  };
  return (
    <SideNavigation
      activeHref={activeHref}
      header={header ? header : defaultNavHeader}
      items={items ? items : adminNavItems}
      onFollow={onFollowHandler ? onFollowHandler : defaultOnFollowHandler}
    />
  );
}
