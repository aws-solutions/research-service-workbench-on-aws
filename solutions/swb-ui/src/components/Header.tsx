import { useTranslation } from 'next-i18next';
import TopNavigation from '@awsui/components-react/top-navigation';
import styles from '../styles/Header.module.scss';
import { useSettings } from '../context/SettingsContext';
import { useAuthentication } from '../context/AuthenticationContext';

export default function Header(): JSX.Element {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user } = useAuthentication();

  const i18nStrings = {
    searchIconAriaLabel: t('Header.Search'),
    searchDismissIconAriaLabel: t('Header. CloseSearch'),
    overflowMenuTriggerText: t('Header.More'),
    overflowMenuTitleText: t('Header.All'),
    overflowMenuBackIconAriaLabel: t('Header.Back'),
    overflowMenuDismissIconAriaLabel: t('Header.CloseMenu')
  };
  const profileActions = [{ type: 'button', id: 'signout', text: t('Header.SignOut') }];
  return (
    <TopNavigation
      id="header"
      className={styles.header}
      i18nStrings={i18nStrings}
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
