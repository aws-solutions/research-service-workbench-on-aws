// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: [
    '@aws/eslint-config-workbench-core-eslint-custom',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/recommended'
  ],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    // disabling this rule because next expects a pages directory which we dont have here
    '@next/next/no-html-link-for-pages': ['off']
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/ignore': ['@cloudscape-design']
  }
};
