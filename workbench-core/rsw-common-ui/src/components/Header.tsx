/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import TopNavigation from '@cloudscape-design/components/top-navigation';
import * as React from 'react';
import { headerLabels } from '../common/labels';
import { useAuthentication } from '../context/AuthenticationContext';
import { useSettings } from '../context/SettingsContext';
import { researcherUser } from '../models/User';

export default function Header(): JSX.Element {
  const { settings } = useSettings();
  const { user, signOut } = useAuthentication();

  const displayUser = user ?? researcherUser;

  const profileActions = [{ id: 'signout', text: headerLabels.signout }];
  return (
    <TopNavigation
      id="header"
      className="header"
      i18nStrings={headerLabels}
      identity={{
        href: '/',
        title: settings.name,
        logo: { src: settings.logo, alt: settings.name }
      }}
      utilities={[
        {
          type: 'menu-dropdown',
          text: `${displayUser.givenName} ${displayUser.familyName}`,
          description: displayUser.email,
          items: profileActions,
          onItemClick: async () => await signOut()
        }
      ]}
    />
  );
}
