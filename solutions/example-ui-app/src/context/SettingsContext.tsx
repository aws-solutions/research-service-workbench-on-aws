import { Context, createContext, useContext, useState } from 'react';
import { AppSettings, defaultAppSettings } from '../models/AppSettings';

export interface SettingsProps {
  settings: AppSettings;
  reload: () => void;
}

const SettingsContext: Context<SettingsProps> = createContext<SettingsProps>({
  settings: defaultAppSettings,
  reload: () => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [settings] = useState<AppSettings>(defaultAppSettings);
  return (
    <SettingsContext.Provider value={{ settings, reload: () => {} }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsProps {
  return useContext(SettingsContext);
}
