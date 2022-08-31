// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@aws/eslint-config-workbench-core-eslint-custom', 'next/core-web-vitals'],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    // these rules are because the @cloudscape-design/components package doesnt export *Props interfaces in index.js files.
    // This causes the eslint errors below
    'import/default': 0,
    'import/namespace': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    // disabling this rule because next expects a pages directory which we dont have here
    '@next/next/no-html-link-for-pages': 0
  }
};
