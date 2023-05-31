/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import AuditEntry from './auditEntry';
import AuditPlugin from './auditPlugin';
import { AuditIncompleteError } from './errors/auditIncompleteError';
import Metadata from './metadata';

/**
 * An AuditServiceConfig interface that contains the configuration for the AuditService.
 */
interface AuditServiceConfig {
  continueOnError?: boolean;
  auditPlugin: AuditPlugin;
  requiredAuditValues: string[];
  fieldsToMask: string[];
}
/**
 * An Audit Service that is responsible for writing audit entries.
 */
export default class AuditService {
  private _auditServiceConfig: AuditServiceConfig;
  /**
   *
   * @param auditPlugin - An {@link AuditPlugin} that can modify and write {@link AuditEntry}.
   * @param continueOnError - An optional flag indicating if the method should continue on error when audit entry
   * does not have all required values.
   * @param requiredAuditValues - A string of values required for auditing.
   * @param fieldsToMask - Fields to mask.
   */
  public constructor(
    auditPlugin: AuditPlugin,
    continueOnError: boolean = false,
    requiredAuditValues: string[] = ['actor', 'source', 'statusCode', 'action'],
    fieldsToMask: string[] = ['password', 'accessKey']
  ) {
    this._auditServiceConfig = { auditPlugin, continueOnError, requiredAuditValues, fieldsToMask };
  }

  /**
   * Validates if an audit entry has all the required audit values.
   *
   * @param auditEntry - The audit entry that is being checked.
   * @returns A boolean indicating whether the audit entry has all required values.
   */
  public isAuditComplete(auditEntry: AuditEntry): boolean {
    for (const value of this._auditServiceConfig.requiredAuditValues) {
      if (!_.has(auditEntry, value) || _.isUndefined(_.get(auditEntry, value))) return false;
    }
    return true;
  }

  /**
   * Creates an {@link AuditEntry} that is modified by the {@link AuditPlugin}.
   *
   * @param metadata - {@link Metadata}
   * @param body - The body containing information about the response.
   * @returns The masked {@link AuditEntry}.
   */
  public async createAuditEntry(metadata: Metadata, body?: object): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {};
    if (body) {
      //in the instance it is an Error
      if (body instanceof Error) {
        auditEntry.body = { error: body.name, message: body.message, stack: body.stack };
      } else {
        auditEntry.body = body;
      }
    }

    auditEntry.timestamp = Date.now();

    await this._auditServiceConfig.auditPlugin.prepare(metadata, auditEntry);
    const maskedAuditEntry: AuditEntry = this._maskAuditEntry(auditEntry);

    return maskedAuditEntry;
  }

  /**
   * Creates an {@link AuditEntry} and writes it using the {@link AuditPlugin}.
   *
   * @param metadata - {@link Metadata}
   * @param body - The body containing information about the response.
   */
  public async write(metadata: Metadata, body?: object): Promise<void> {
    const auditEntry: Readonly<AuditEntry> = await this.createAuditEntry(metadata, body);
    if (!this.isAuditComplete(auditEntry) && !this._auditServiceConfig.continueOnError) {
      throw new AuditIncompleteError('Audit Entry is not complete');
    }
    await this._auditServiceConfig.auditPlugin.write(metadata, auditEntry);
  }

  private _maskAuditEntry(auditEntry: AuditEntry): AuditEntry {
    for (const [key, value] of Object.entries(auditEntry)) {
      if (_.isObject(value)) {
        _.set(auditEntry, key, this._maskDeep(value));
      } else if (this._auditServiceConfig.fieldsToMask.includes(key)) {
        _.set(auditEntry, key, '****');
      }
    }
    return auditEntry;
  }

  private _maskDeep(obj: object): object {
    return _.transform(obj, (curObj: object, value: unknown, key: string) => {
      if (_.isUndefined(value)) return;
      const newValue = _.isObject(value)
        ? this._maskDeep(value)
        : this._auditServiceConfig.fieldsToMask.includes(key)
        ? '****'
        : value;
      _.set(curObj, key, newValue);
    });
  }
}
