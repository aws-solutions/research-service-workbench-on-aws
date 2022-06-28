import Box from '@awsui/components-react/box';
import Button from '@awsui/components-react/button';
import Container from '@awsui/components-react/container';
import Grid from '@awsui/components-react/grid';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import pkceChallenge from 'pkce-challenge';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { login } from '../api/auth';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Hero.module.scss';

function Hero(): JSX.Element {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // TODO: Get AuthN provider config values via API call
  // For now assuming we have it

  // const cognitoDomain = 'https://swbv2-sample.auth.us-east-1.amazoncognito.com';
  // const userPoolId = 'us-east-1_yHqLSL1nE';
  // const clientId = '3r216qd551ls80vk1ostk0dvbu';
  // const websiteUrl = 'http://localhost:3000';
  // const loginUrl = `${cognitoDomain}/oath2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${websiteUrl}/&code_challenge_method=S256&code_challenge=TEMP_PKCE_VERIFIER&state=TEMP_STATE_VERIFIER`;
  // const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&response_type=code&redirect_uri=${websiteUrl}`;

  // TODO: State management

  // const [loggedIn, setLoggedIn] = useState(false);
  // const [info, setInfo] = useState<Record<string, string> | undefined>(undefined);
  // const [guestLogin, setGuestLogin] = useState(false);
  // const [adminLogin, setAdminLogin] = useState(false);

  async function loginEvent(): Promise<void> {
    try {
      const response = await login();
      console.log(response.redirectUrl);
      let signInUrl: string = response.redirectUrl;

      const challenge = pkceChallenge(128);
      localStorage.setItem('pkceVerifier', challenge.code_verifier);
      signInUrl = signInUrl.replace('TEMP_CODE_CHALLENGE', challenge.code_challenge);

      const nonceState = uuid();
      localStorage.setItem('stateVerifier', nonceState);
      signInUrl = signInUrl.replace('TEMP_STATE_VERIFIER', nonceState);
      window.location.assign(signInUrl);
    } catch (e) {
      console.log(e);
    }
  }

  // TODO: If logged in, route to "/environments" page

  return (
    <div className="custom-home__header">
      <Box padding={{ vertical: 'xxxl', horizontal: 's' }}>
        <Grid
          gridDefinition={[
            { colspan: { xl: 6, l: 5, s: 6, xxs: 10 }, offset: { l: 2, xxs: 1 } },
            { colspan: { xl: 2, l: 3, s: 4, xxs: 10 }, offset: { s: 0, xxs: 1 } }
          ]}
        >
          <div className="custom-home__header-title">
            <Box variant="h1" fontWeight="heavy" padding="n" fontSize="display-l" color="inherit">
              <span>{settings.name}</span>
            </Box>
            {settings.slogan && (
              <Box fontWeight="light" padding={{ bottom: 's' }} fontSize="display-l" color="inherit">
                <span>{settings.slogan}</span>
              </Box>
            )}
            {settings.description && (
              <Box variant="p" fontWeight="light">
                <span className="custom-home__header-sub-title">{settings.description}</span>
              </Box>
            )}
            <Button
              className={styles.primaryButton}
              variant="primary"
              onClick={async () => await loginEvent()}
            >
              Login
            </Button>
          </div>
          <div className="custom-home__header-cta">
            <Container>
              <Image
                src="/login-image.gif"
                layout="responsive"
                width="10px"
                height="10px"
                alt={t('Hero.SWBImageAlt')}
              />
            </Container>
          </div>
        </Grid>
      </Box>
    </div>
  );
}

export default Hero;
