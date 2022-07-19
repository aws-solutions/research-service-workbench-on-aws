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
  const closeNotification = (id: string): void => {
    const others = { ...notifications };
    // eslint-disable-next-line security/detect-object-injection
    delete others[id];
    setNotifications(others);
  };
  return (
    <NotificationsContext.Provider value={{ notifications, displayNotification, closeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationProps {
  return useContext(NotificationsContext);
}
