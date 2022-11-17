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
    // These rules are turned off to be compatible with @cloudscape-design/components exported components
    'import/namespace': 0
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
