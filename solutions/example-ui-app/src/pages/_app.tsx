/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import '../styles/globals.scss';
import '@awsui/global-styles/index.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import nextI18NextConfig from '../../next-i18next.config';
import BaseLayout from '../components/BaseLayout';
import Header from '../components/Header';
import { AuthenticationProvider } from '../context/AuthenticationContext';
import { NotificationsProvider } from '../context/NotificationContext';
import { SettingsProvider } from '../context/SettingsContext';

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SettingsProvider>
      <NotificationsProvider>
        <AuthenticationProvider>
          <Header />
          <BaseLayout>
            <Component {...pageProps} />
          </BaseLayout>
          <footer id="footer"></footer>
        </AuthenticationProvider>
      </NotificationsProvider>
    </SettingsProvider>
  );
}

const App: unknown = appWithTranslation(MyApp, nextI18NextConfig);
export default App;
