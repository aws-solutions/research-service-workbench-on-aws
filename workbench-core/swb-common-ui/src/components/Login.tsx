/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Button from '@cloudscape-design/components/button';
import * as React from 'react';
import { useAuthentication } from '../context/AuthenticationContext';

export default function Login(): JSX.Element {
  const { signIn } = useAuthentication();

  return (
    <Button
      data-testid="login"
      className="primaryButton"
      variant="primary"
      onClick={async () => await signIn()}
    >
      Login
    </Button>
  );
}