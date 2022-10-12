/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { nameRegex, ValidationRule } from '@aws/workbench-core-swb-common-ui';

export const datasetNameValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (a: string | undefined) => !!a,
    message: 'Dataset Name is Required'
  },
  {
    condition: (a: string | undefined) => !!a && nameRegex.test(a),
    message:
      'Dataset Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
  },
  {
    condition: (a: string | undefined) => !!a && a.length <= 100,
    message: 'Dataset Name cannot be longer than 100 characters'
  }
];

export const datasetDescriptionValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (a: string | undefined) => !a || a.length <= 500,
    message: 'Description cannot be longer than 500 characters'
  }
];

export const datasetProjectIdValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (a: string | undefined) => !!a,
    message: 'Project ID is Required'
  }
];
