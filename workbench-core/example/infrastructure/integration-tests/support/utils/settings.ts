/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */
import _ from 'lodash';

export interface Setting {
  runId: string;
  rootUserNameParamStorePath: string;
  rootPasswordParamStorePath: string;

  // Main CFN template outputs
  ExampleS3BucketExampleS3BucketDatasetsArnOutput393A6D8B: string;
  MainAccountId: string;
  MainAccountRegion: string;
  ExampleCognitoWebUiUserPoolClientId: string;
  ExampleCognitoIntegrationTestUserPoolClientId: string;
  ExampleEncryptionKeyEncryptionKeyOutput172B0370: string;
  ExampleS3BucketAccessLogsNameOutput: string;
  ExampleRestApiEndpoint9C6D55BB: string;
  ExampleAPIEndpoint: string;
  ExampleCognitoDomainName: string;
  ExampleCognitoUserPoolId: string;
  ExampleLambdaRoleOutput: string;
  ExampleS3DataSetsBucketName: string;
  ExampleDataSetDDBTableArn: string;
  ExampleDataSetDDBTableName: string;
  ExampleDynamicAuthDDBTableArn: string;
  ExampleDynamicAuthDDBTableName: string;

  // Host CFN template outputs
  ExampleHostS3DataSetsBucketName: string;
  ExampleHostDatasetRoleOutput: string;
  HostingAccountId: string;
  HostingAccountRegion: string;

  // Derived
  rootUserId: string;
}

export type SettingKey = keyof Setting;
/**
 * All settings used during the tests are stored here. The main advantage of having to use get/set methods
 * when accessing settings values is so that we can print an informative message when keys are missing.
 */
export default class Settings {
  private _content: Setting;

  public constructor(yamlObject: Setting) {
    this._content = _.cloneDeep(yamlObject);
  }

  public get entries(): Setting {
    return _.cloneDeep(this._content);
  }

  public set(key: SettingKey, value: string): void {
    // TODO: Prevent updating main CFN output values
    this._content[key] = value;
  }

  public get(key: SettingKey): string {
    const value = this._content[key];
    if (_.isEmpty(value) && !_.isBoolean(value))
      throw new Error(`The "${key}" setting value is required but it is either empty or not a boolean`);

    return value;
  }

  public optional(key: SettingKey, defaultValue?: string): string | undefined {
    const value = this._content[key];
    if (_.isNil(value) || (_.isString(value) && _.isEmpty(value))) return defaultValue;

    return value;
  }
}

module.exports = Settings;
