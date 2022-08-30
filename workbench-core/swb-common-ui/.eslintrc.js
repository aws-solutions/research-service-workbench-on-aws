// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@aws/eslint-config-workbench-core-eslint-custom'],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    'import/default': 0,
    'import/namespace': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0
  }
};
