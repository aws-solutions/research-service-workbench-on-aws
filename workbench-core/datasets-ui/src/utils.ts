/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { nameRegex, ValidationRule } from '@aws/workbench-core-swb-common-ui';

export const datasetNameValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (datasetName: string | undefined) => !!datasetName,
    message: 'Dataset Name is Required'
  },
  {
    condition: (datasetName: string | undefined) => !!datasetName && nameRegex.test(datasetName),
    message:
      'Dataset Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
  },
  {
    condition: (datasetName: string | undefined) => !!datasetName && datasetName.length <= 100,
    message: 'Dataset Name cannot be longer than 100 characters'
  }
];

export const datasetDescriptionValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (description: string | undefined) => !description || description.length <= 500,
    message: 'Description cannot be longer than 500 characters'
  }
];

export const datasetProjectIdValidationRules: ValidationRule<string | undefined>[] = [
  {
    condition: (projectId: string | undefined) => !!projectId,
    message: 'Project ID is Required'
  }
];
