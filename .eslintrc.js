module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:react-native/all'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-native', 'no-relative-import-paths'],
  rules: {
    // Design System Enforcement
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.name='StyleSheet'] > ObjectExpression > Property[key.name='color'] > Literal[value=/^#[0-9a-fA-F]{6}$/]",
        message:
          'Hardcoded colors are not allowed. Use theme.colors instead. See DESIGN_SYSTEM.md',
      },
    ],

    'no-restricted-properties': [
      'error',
      {
        object: 'StyleSheet',
        property: 'create',
        message:
          'Avoid inline StyleSheet.create with hardcoded values. Use theme colors, typography, and spacing from DESIGN_SYSTEM.md',
      },
    ],

    // Enforce theme usage
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-types': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],

    // Prevent direct RNText usage
    'react-native/no-raw-text': 'off', // We use Text component wrapper

    // Component usage enforcement
    'react-native/sort-styles': 'warn',
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],

  env: {
    browser: true,
    node: true,
    'react-native/react-native': true,
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
