# Workbench Core ESLint Config Custom

## Description
Custom ESLint rules

## Usage
1. Update your package.json:

```
"devDependencies": {
    .
    .
    "@amzn/eslint-config-workbench-core-eslint-custom": "workspace:*"
  }
```

2. Update your eslintrc.js:

```
// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: [
    '@amzn/workbench-core-eslint-custom'
  ],
  parserOptions: { tsconfigRootDir: __dirname }
};
```
