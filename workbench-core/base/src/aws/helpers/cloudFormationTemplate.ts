/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface CFNTemplateParameters {
  [key: string]: {
    AllowedPattern?: string;
    AllowedValues?: string[];
    ConstraintDescription?: string;
    Default?: string;
    Description?: string;
    MaxLength?: number;
    MaxValue?: number;
    MinLength?: number;
    MinValue?: number;
    NoEcho?: boolean;
    Type: string;
  };
}

export interface CFNTemplate {
  AWSTemplateFormatVersion?: string;
  Description?: string;
  Metadata?: {};
  Parameters?: CFNTemplateParameters;
  Rules?: {};
  Mappings?: {};
  Conditions?: {};
  Transform?: {};
  Resources: {};
  Outputs?: {};
}
