/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Input from '@awsui/components-react/input';
import TopNavigation from '@awsui/components-react/top-navigation';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useAuthentication } from '../context/AuthenticationContext';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Header.module.scss';

export default function Header(): JSX.Element {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user } = useAuthentication();

  const [searchValue, setSearchValue] = useState('');
  const i18nStrings = {
    searchIconAriaLabel: t('Header.Search'),
    searchDismissIconAriaLabel: t('Header. CloseSearch'),
    overflowMenuTriggerText: t('Header.More'),
    overflowMenuTitleText: t('Header.All'),
    overflowMenuBackIconAriaLabel: t('Header.Back'),
    overflowMenuDismissIconAriaLabel: t('Header.CloseMenu')
  };
  const profileActions = [
    { type: 'button', id: 'profile', text: t('Header.Profile') },
    { type: 'button', id: 'preferences', text: t('Header.Preferences') },
    { type: 'button', id: 'security', text: t('Header.Security') },
    {
      type: 'menu-dropdown',
      id: 'support-group',
      text: t('Header.Support'),
      items: [
        {
          id: 'documentation',
          text: t('Header.Documentation'),
          href: '#',
          external: true,
          externalIconAriaLabel: t('Header.ExternalIconLabel')
        },
        {
          id: 'feedback',
          text: t('Header.Feedback'),
          href: '#',
          external: true,
          externalIconAriaLabel: t('Header.ExternalIconLabel')
        },
        { id: 'support', text: t('Header.CustomerSupport') }
      ]
    },
    { type: 'button', id: 'signout', text: t('Header.SignOut') }
  ];
  return (
    <TopNavigation
      id="header"
      className={styles.header}
      i18nStrings={i18nStrings}
      identity={{
        href: '#',
        title: settings.name,
        logo: { src: settings.logo, alt: settings.name }
      }}
      search={
        <Input
          ariaLabel={t('Header.SearchInput')}
          value={searchValue}
          type="search"
          placeholder={t('Header.Search')}
          onChange={({ detail }) => setSearchValue(detail.value)}
        />
      }
      utilities={[
        {
          type: 'button',
          iconName: 'notification',
          ariaLabel: 'Notifications',
          badge: true,
          disableUtilityCollapse: true
        },
        { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
        {
          type: 'menu-dropdown',
          text: user.name,
          description: user.email,
          iconName: user.avatar.name,
          iconAlt: user.avatar.alt,
          iconSvg: user.avatar.svg,
          iconUrl: user.avatar.url,
          items: profileActions
        }
      ]}
    />
  );
}
