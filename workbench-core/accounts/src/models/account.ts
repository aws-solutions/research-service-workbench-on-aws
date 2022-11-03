/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { HostingAccountStatus } from '../constants/hostingAccountStatus';
import CostCenter from './costCenter/costCenter';

export interface AccountProperties {
  id: string;
  name: string;
  awsAccountId: string;
  envMgmtRoleArn: string;
  error?: { type: string; value: string };
  hostingAccountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  cidr: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId: string;
  stackName: string;
  status: HostingAccountStatus;
  CC?: CostCenter;
  updatedAt: string;
  createdAt: string;
}

export class Account implements AccountProperties {
  public readonly id: string;
  public readonly name: string;
  public readonly awsAccountId: string;
  public readonly envMgmtRoleArn: string;
  public error?: { type: string; value: string };
  public readonly hostingAccountHandlerRoleArn: string;
  public readonly vpcId: string;
  public readonly subnetId: string;
  public readonly cidr: string;
  public readonly environmentInstanceFiles: string;
  public readonly encryptionKeyArn: string;
  public readonly externalId: string;
  public readonly stackName: string;
  public readonly status: HostingAccountStatus;
  public CC?: CostCenter;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public constructor(properties?: AccountProperties) {
    this.id = properties?.id || '';
    this.name = properties?.name || '';
    this.awsAccountId = properties?.awsAccountId || '';
    this.envMgmtRoleArn = properties?.envMgmtRoleArn || '';
    this.error = properties?.error;
    this.hostingAccountHandlerRoleArn = properties?.hostingAccountHandlerRoleArn || '';
    this.vpcId = properties?.vpcId || '';
    this.subnetId = properties?.subnetId || '';
    this.cidr = properties?.cidr || '';
    this.environmentInstanceFiles = properties?.environmentInstanceFiles || '';
    this.encryptionKeyArn = properties?.encryptionKeyArn || '';
    this.externalId = properties?.externalId || '';
    this.stackName = properties?.stackName || '';
    this.status = properties?.status || '';
    this.CC = properties?.CC;
    this.createdAt = properties?.createdAt || '';
    this.updatedAt = properties?.updatedAt || '';
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromDynamoItem(dynamoProperties: { [key: string]: any }): Account {
    const properties = _.pick(
      dynamoProperties,
      Object.getOwnPropertyNames(new Account())
    ) as AccountProperties;
    return new Account(properties);
  }
}
