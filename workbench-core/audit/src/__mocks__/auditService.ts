/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditPlugin from '../auditPlugin';
import Metadata from '../metadata';

export default class AuditService {
  public constructor(
    _auditPlugin: AuditPlugin,
    _continueOnError: boolean = false,
    _requiredAuditValues: string[] = ['actor', 'source', 'statusCode', 'action'],
    _fieldsToMask: string[] = ['password', 'accessKey']
  ) {}

  public async write(_metadata: Metadata, _body?: object): Promise<void> {}
}
