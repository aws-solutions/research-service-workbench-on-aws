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
  plugins: ['testing-library'],
  overrides: [
    // Only uses Testing Library lint rules in test files
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react']
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // suppress errors for missing 'import React' in files
    'react/react-in-jsx-scope': 'off',
    // allow jsx syntax in js files (for next.js project)
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }] //should add ".ts" if typescript project
  }
};
