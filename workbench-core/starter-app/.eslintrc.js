// This is a workaround for https://github.com/eslint/eslint/issues/3458
// require('@rushstack/eslint-config/patch/modern-module-resolution');
require('@amzn/eslint-config-workbench-core-eslint-custom/node_modules/@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@amzn/workbench-core-eslint-custom', 'next/core-web-vitals'],
  parserOptions: { tsconfigRootDir: __dirname }
};
