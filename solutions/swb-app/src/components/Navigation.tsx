import { useTranslation } from 'next-i18next';
import SideNavigation, { SideNavigationProps } from '@awsui/components-react/side-navigation';

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
  // Left nav for admin
  const adminNavHeader: SideNavigationProps.Header = {
    text: t('Navigation.Administrator'),
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
    },
    { type: 'link', text: t('Navigation.Workspaces'), href: '#/workspaces' },
    { type: 'link', text: t('Navigation.Datasets'), href: '#/datasets' }
  ];
  // Left nav for users
  const userNavHeader: SideNavigationProps.Header = {
    text: t('Navigation.User'),
    href: '#/user'
  };
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: t('Navigation.Workspaces'), href: '#/workspaces' },
    { type: 'link', text: t('Navigation.Datasets'), href: '#/datasets' },
    {
      type: 'section',
      text: t('Navigation.Dashboard'),
      items: [
        { type: 'link', text: t('Navigation.AllDashboards'), href: '#/dashboard/all' },
        { type: 'link', text: t('Navigation.ProjectDashboards'), href: '#/dashvoard/projects' }
      ]
    }
  ];
  const defaultOnFollowHandler = (ev: CustomEvent): void => {
    // keep the locked href for our demo pages
    ev.preventDefault();
  };
  return (
    // TODO: add logic for which nav to display (admin or user)
    <SideNavigation
      activeHref={activeHref}
      header={header ? header : userNavHeader}
      items={items ? items : userNavItems}
      onFollow={onFollowHandler ? onFollowHandler : defaultOnFollowHandler}
    />
  );
}
