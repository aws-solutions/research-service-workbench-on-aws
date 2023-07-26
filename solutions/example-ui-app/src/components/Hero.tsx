/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Box from '@awsui/components-react/box';
import Button from '@awsui/components-react/button';
import Container from '@awsui/components-react/container';
import Grid from '@awsui/components-react/grid';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useSettings } from '../context/SettingsContext';
import styles from '../styles/Hero.module.scss';

function Hero(): JSX.Element {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <div className="custom-home__header">
      <Box padding={{ vertical: 'xxxl', horizontal: 's' }}>
        <Grid
          gridDefinition={[
            { offset: { l: 2, xxs: 1 }, colspan: { l: 8, xxs: 10 } },
            { colspan: { xl: 6, l: 5, s: 6, xxs: 10 }, offset: { l: 2, xxs: 1 } },
            { colspan: { xl: 2, l: 3, s: 4, xxs: 10 }, offset: { s: 0, xxs: 1 } }
          ]}
        >
          <Box fontWeight="light" padding={{ top: 'xs' }}>
            <span className="custom-home__category">Accountability</span>
          </Box>
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
            <Button className={styles.primaryButton} variant="primary" href="#/">
              Go to dashboard
            </Button>
          </div>
          <div className="custom-home__header-cta">
            <Container>
              <Image
                src="/image.png"
                layout="responsive"
                width="200px"
                height="200px"
                alt={t('Hero.DashboardImageAlt')}
              />
            </Container>
          </div>
        </Grid>
      </Box>
    </div>
  );
}

export default Hero;
