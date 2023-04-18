/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { importConvention } from './rules/import-convention';
import { namingConvention } from './rules/naming-convention';

const rules: any = Object.assign({}, namingConvention.rules, importConvention.rules, {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'parameter',
      modifiers: ['unused'],
      format: ['strictCamelCase'],
      leadingUnderscore: 'allow'
    }
  ]
});

export const customESLint: any = {
  plugins: ['security', 'import'],
  extends: [
    '@rushstack/eslint-config/profile/node',
    '@rushstack/eslint-config/mixins/tsdoc',
    'plugin:security/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  rules,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  }
};
