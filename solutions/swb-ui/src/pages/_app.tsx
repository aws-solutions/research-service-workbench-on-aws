// No BaseLayout for the global _app.tsx because login page should have no nav
import '@awsui/global-styles/index.css';
import '../styles/globals.scss';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import { AuthenticationProvider } from '../context/AuthenticationContext';
import { NotificationsProvider } from '../context/NotificationContext';
import { SettingsProvider } from '../context/SettingsContext';

// eslint-disable-next-line @rushstack/typedef-var
const nextI18NextConfig = require('../../next-i18next.config');

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
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

const App: unknown = appWithTranslation(MyApp, nextI18NextConfig);
export default App;
