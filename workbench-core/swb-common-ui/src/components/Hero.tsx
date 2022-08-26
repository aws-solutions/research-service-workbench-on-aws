/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Box from '@cloudscape-design/components/box';
import Grid from '@cloudscape-design/components/grid';
import * as React from 'react';
import { useSettings } from '../context/SettingsContext';
import Login from './Login';

export default function Hero(): JSX.Element {
  const { settings } = useSettings();

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
            <Login />
          </div>
          <div className="custom-home__header-cta"></div>
        </Grid>
      </Box>
    </div>
  );
}
