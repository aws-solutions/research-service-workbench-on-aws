/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import JSONValue from '../../types/json';

// eslint-disable-next-line @rushstack/typedef-var
export const CFNTemplateParametersParser = z.record(
  z.object({
    AllowedPattern: z.string().optional(),
    AllowedValues: z.string().array().optional(),
    ConstraintDescription: z.string().optional(),
    Default: z.string().optional(),
    Description: z.string().optional(),
    MaxLength: z.number().optional(),
    MaxValue: z.number().optional(),
    MinLength: z.number().optional(),
    MinValue: z.number().optional(),
    NoEcho: z.boolean().optional(),
    Type: z.string()
  })
);
export type CFNTemplateParameters = z.infer<typeof CFNTemplateParametersParser>;

export interface CFNTemplate {
  AWSTemplateFormatVersion?: string;
  Description?: string;
  Metadata?: Record<string, JSONValue>;
  Parameters?: CFNTemplateParameters;
  Rules?: Record<string, JSONValue>;
  Mappings?: Record<string, JSONValue>;
  Conditions?: Record<string, JSONValue>;
  Transform?: Record<string, JSONValue>;
  Resources: Record<string, JSONValue>;
  Outputs?: Record<string, JSONValue>;
}
