/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { AppSettings, defaultAppSettings } from '../models/AppSettings';

export interface SettingsProps {
  settings: AppSettings;
  reload: () => void;
}

const SettingsContext: React.Context<SettingsProps> = React.createContext<SettingsProps>({
  settings: defaultAppSettings,
  reload: () => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [settings] = React.useState<AppSettings>(defaultAppSettings);
  return (
    <SettingsContext.Provider value={{ settings, reload: () => {} }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsProps {
  return React.useContext(SettingsContext);
}
