// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist', 'tmp', 'examples'],
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-case-declarations': 'off',
      'no-cond-assign': 'off',
      'no-empty': 'warn',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-unexpected-multiline': 'off',
      'no-unsafe-finally': 'off',
      'no-useless-escape': 'off',
    },
  },
);
