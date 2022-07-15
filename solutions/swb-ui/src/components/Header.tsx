import TopNavigation from '@awsui/components-react/top-navigation';
import { headerLabels } from '../common/labels';
import { useAuthentication } from '../context/AuthenticationContext';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Header.module.scss';

export default function Header(): JSX.Element {
  const { settings } = useSettings();
  const { user } = useAuthentication();

  const profileActions = [{ type: 'button', id: 'signout', text: headerLabels.signout }];
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
