/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import TopNavigation from '@awsui/components-react/top-navigation';
import { headerLabels } from '../common/labels';
import { useAuthentication } from '../context/AuthenticationContext';
import { useSettings } from '../context/SettingsContext';
import { researcherUser } from '../models/User';
import styles from '../styles/Header.module.scss';

export default function Header(): JSX.Element {
  const { settings } = useSettings();
  // eslint-disable-next-line prefer-const
  let { user, signOut } = useAuthentication();

  if (user === undefined) {
    user = researcherUser;
  }

  const profileActions = [{ id: 'signout', text: headerLabels.signout }];
  return (
    <TopNavigation
      id="header"
      className={styles.header}
      i18nStrings={headerLabels}
      identity={{
        href: '/',
        title: settings.name,
        logo: { src: settings.logo, alt: settings.name }
      }}
      utilities={[
        {
          type: 'menu-dropdown',
          text: `${user.givenName} ${user.familyName}`,
          description: user.email,
          items: profileActions,
          onItemClick: async () => await signOut()
        }
      ]}
    />
  );
}
