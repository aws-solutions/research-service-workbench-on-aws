// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@aws/eslint-config-workbench-core-eslint-custom'],
  parserOptions: { tsconfigRootDir: __dirname },
  // These rules are turned off to be compatible with aws-jwt-verify exported components
  rules: {
    'import/namespace': ['off']
  }
};
