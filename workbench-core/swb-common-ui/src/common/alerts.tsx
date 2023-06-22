/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Alert, AlertProps, Button } from '@cloudscape-design/components';
import * as React from 'react';

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
