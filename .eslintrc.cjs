/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2023: true,
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'import', 'promise'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: [
          './tsconfig.base.json',
          './apps/api/tsconfig.json',
          './apps/web/tsconfig.json',
          './packages/db/tsconfig.json',
          './packages/contracts/tsconfig.json',
        ],
      },
    },
  },
  overrides: [
    {
      files: ['apps/api/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./apps/api/tsconfig.json'],
      },
    },
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./apps/web/tsconfig.json'],
      },
    },
    {
      files: ['packages/db/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./packages/db/tsconfig.json'],
      },
    },
    {
      files: ['packages/contracts/**/*.{ts,tsx}'],
      parserOptions: {
        project: ['./packages/contracts/tsconfig.json'],
      },
    },
  ],
  rules: {
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: false } },
    ],
  },
  ignorePatterns: [
    '**/dist/**',
    '**/build/**',
    '**/.vite/**',
    '**/coverage/**',
    '**/node_modules/**',
  ],
};
