/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, Context, useState } from 'react';
import { FlashbarProps } from '@awsui/components-react/flashbar';

export interface Notifications {
  [key: string]: FlashbarProps.MessageDefinition;
}

export interface NotificationProps {
  notifications: Notifications;
  displayNotification: (id: string, notification: FlashbarProps.MessageDefinition) => void;
}

const NotificationsContext: Context<NotificationProps> = createContext({
  notifications: {} as Notifications,
  displayNotification: (id: string, notification: FlashbarProps.MessageDefinition) => {}
});

export function NotificationsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [notifications, setNotifications] = useState<Notifications>({});
  const displayNotification = (id: string, notification: FlashbarProps.MessageDefinition): void => {
    if (id in notifications) {
      return;
    }
    const others = { ...notifications };
    // eslint-disable-next-line security/detect-object-injection
    others[id] = notification;
    setNotifications(others);
  };
  return (
    <NotificationsContext.Provider value={{ notifications, displayNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationProps {
  return useContext(NotificationsContext);
}
