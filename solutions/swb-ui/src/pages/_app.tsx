/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// No BaseLayout for the global _app.tsx because login page should have no nav
import '@awsui/global-styles/index.css';
import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import { AuthenticationProvider } from '../context/AuthenticationContext';
import { NotificationsProvider } from '../context/NotificationContext';
import { SettingsProvider } from '../context/SettingsContext';

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
