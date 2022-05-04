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
  const adminNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    {
      type: 'section',
      text: t('Dashboards'),
      items: [
        { type: 'link', text: t('Manage Dashboards'), href: '#/dashboards/manage' },
        { type: 'link', text: t('All Dashboards'), href: '#/dashboards' },
        { type: 'link', text: t('Project Dashboards'), href: '#/dashboards/project' }
      ]
    },
    { type: 'link', text: t('Users'), href: '#/users' },
    { type: 'link', text: t('Workspaces'), href: '#/workspaces' },
    { type: 'link', text: t('Datasets'), href: '#/datasets' }
  ];
  const userNavItems: ReadonlyArray<SideNavigationProps.Item> = [
    { type: 'link', text: t('Workspaces'), href: '#/workspaces' },
    { type: 'link', text: t('Datasets'), href: '#/datasets' },
    {
      type: 'section',
      text: t('Dashboards'),
      items: [
        { type: 'link', text: t('All Dashboards'), href: '#/dashboards' },
        { type: 'link', text: t('Project Dashboards'), href: '#/dashboards/projects' }
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
      items={items ? items : userNavItems}
      onFollow={onFollowHandler ? onFollowHandler : defaultOnFollowHandler}
    />
  );
}
