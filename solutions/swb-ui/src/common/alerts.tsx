import { Alert, AlertProps, Button } from '@awsui/components-react';
import React from 'react';

export function TerminateWarning(
  item: string,
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
): AlertProps {
  return (
    <Alert
      onDismiss={() => setVisible(false)}
      visible={visible}
      dismissAriaLabel="Close alert"
      type="warning"
      action={<Button variant="primary">{`Permanently delete ${item}`}</Button>}
    >
      {`You are about to permanently delete ${item}(s).`}
    </Alert>
  );
}
