import { namingConvention } from './rules/naming-convention';
import { importConvention } from './rules/import-convention';

const rules = Object.assign({}, namingConvention.rules, importConvention.rules);
export const customESLint = {
  plugins: ['security', 'import'],
  extends: [
    '@rushstack/eslint-config/profile/node',
    '@rushstack/eslint-config/mixins/tsdoc',
    'plugin:security/recommended',
    'plugin:import/recommended'
  ],
  rules: rules
};
