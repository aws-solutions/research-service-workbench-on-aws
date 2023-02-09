/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';

export function setUpSshKeyRoutes(router: Router, sshKeyService: SshKeyPlugin): void {}
