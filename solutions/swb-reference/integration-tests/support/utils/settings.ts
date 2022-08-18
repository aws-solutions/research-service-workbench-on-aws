/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */
import _ from 'lodash';

interface Setting {
  envTypeId: string;
  envTypeConfigId: string;
  projectId: string;
  envType: string;
  runId: string;
  terminatedEnvId: string;
  rootUsername: string;
  rootPasswordParamStorePath: string;

  // Main CFN template outputs
  cognitoUserPoolClientId: string;
  MainAccountEncryptionKeyOutput: string;
  SagemakerNotebookTerminateSSMDocOutput: string;
  awsRegion: string;
  DataSetsBucketName: string;
  apiUrlOutput: string;
  S3BucketArtifactsArnOutput: string;
  uiClientURL: string;
  LaunchConstraintIamRoleNameOutput: string;
  S3BucketDatasetsArnOutput: string;
  StatusHandlerLambdaArnOutput: string;
  ApiLambdaRoleOutput: string;
  AccountHandlerLambdaRoleOutput: string;
  cognitoUserPoolId: string;
  S3BucketAccessLogsNameOutput: string;
  SagemakerNotebookLaunchSSMDocOutput: string;
  awsRegionShortName: string;
  cognitoDomainName: string;
  APIGatewayAPIEndpoint67A1C4AD: string;
  dynamoDBTableOutput: string;
  StatusHandlerLambdaRoleOutput: string;

  // Derived
  mainAccountId: string;
}

type SettingKey = keyof Setting;
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

  public optional(key: SettingKey, defaultValue: string): string {
    const value = this._content[key];
    if (_.isNil(value) || (_.isString(value) && _.isEmpty(value))) return defaultValue;

    return value;
  }
}

module.exports = Settings;
