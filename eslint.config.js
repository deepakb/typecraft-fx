import eslintPluginReact from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': typescriptEslint,
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    files: ['src/**/*.{js,ts,jsx,tsx}', 'tests/**/*.{js,ts,jsx,tsx}'], // Include src and tests folders
    ignores: ['dist'], // Exclude dist folder
  },
];
