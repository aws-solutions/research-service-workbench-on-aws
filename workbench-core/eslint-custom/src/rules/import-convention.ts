// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importConvention: any = {
  rules: {
    'import/no-unresolved': ['off'],
    'import/named': ['off'],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        groups: ['builtin', 'external', 'parent', 'sibling']
      }
    ],
    'import/newline-after-import': ['error']
  }
};
