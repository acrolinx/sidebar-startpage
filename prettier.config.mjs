export default {
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: ['**/*.ts', '**/*.mts'],
      options: {
        parser: 'typescript',
      },
    },
  ],
  printWidth: 120,
  tabWidth: 2,
  endOfLine: 'lf',
  arrowParens: 'avoid',
};
