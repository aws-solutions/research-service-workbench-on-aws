import { namingConvention } from './rules/naming-convention';

export const customESLint = {
  plugins: ['security'],
  extends: [
    '@rushstack/eslint-config/profile/node',
    '@rushstack/eslint-config/mixins/tsdoc',
    'plugin:security/recommended'
  ],
  rules: namingConvention.rules
};
