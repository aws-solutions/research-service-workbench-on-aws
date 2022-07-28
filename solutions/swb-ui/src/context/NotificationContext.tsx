/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FlashbarProps } from '@awsui/components-react/flashbar';
import { createContext, useContext, Context, useState } from 'react';

export interface Notifications {
  [key: string]: FlashbarProps.MessageDefinition;
}

export interface NotificationProps {
  notifications: Notifications;
  displayNotification: (id: string, notification: FlashbarProps.MessageDefinition) => void;
  closeNotification: (id: string) => void;
}

const NotificationsContext: Context<NotificationProps> = createContext({
  notifications: {} as Notifications,
  displayNotification: (id: string, notification: FlashbarProps.MessageDefinition) => {},
  closeNotification: (id: string) => {}
});

export function NotificationsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [allNotifications, setAllNotifications] = useState<Notifications>({});
  const displayNotification = (id: string, notification: FlashbarProps.MessageDefinition): void => {
    if (id in allNotifications) {
      return;
    }
    const currentNotifications = { ...allNotifications };
    // eslint-disable-next-line security/detect-object-injection
    currentNotifications[id] = notification;
    setAllNotifications(currentNotifications);
  };
  const closeNotification = (id: string): void => {
    const currentNotifications = { ...allNotifications };
    // eslint-disable-next-line security/detect-object-injection
    delete currentNotifications[id];
    setAllNotifications(currentNotifications);
  };
  return (
    <NotificationsContext.Provider
      value={{ notifications: allNotifications, displayNotification, closeNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationProps {
  return useContext(NotificationsContext);
}
