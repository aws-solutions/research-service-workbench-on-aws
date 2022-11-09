/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// No BaseLayout for the global _app.tsx because login page should have no nav
import '@cloudscape-design/global-styles/index.css';
import '../styles/globals.scss';
import '../styles/Header.module.scss';
import '../styles/Hero.module.scss';
import {
  AuthenticationProvider,
  NotificationsProvider,
  SettingsProvider,
  Header
} from '@aws/workbench-core-swb-common-ui';
import type { AppProps } from 'next/app';

// eslint-disable-next-line @typescript-eslint/naming-convention
function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SettingsProvider>
      <NotificationsProvider>
        <AuthenticationProvider>
          <Header />
          <Component {...pageProps} />
          <footer id="footer"></footer>
        </AuthenticationProvider>
      </NotificationsProvider>
    </SettingsProvider>
  );
}

export default App;
