/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { SshKeyPlugin } from './keyPairs/sshKeyPlugin';

export function setUpSshKeyRoutes(router: Router, keyPairService: SshKeyPlugin): void {}
