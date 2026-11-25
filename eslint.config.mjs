import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

// Rules mirror CONTRIBUTING.md. Keep them in sync.
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'allure-results/**',
      'allure-report/**',
      'test-results/**',
      '.auth/**',
      'requirements/**',
      'bugs/**',
      'author-guides/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      'no-irregular-whitespace': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Test code: Playwright rules, no static waits, assertions required.
    files: ['tests/**/*.ts', 'components/**/*.ts', 'pages/**/*.ts', 'fixtures/**/*.ts', 'utils/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      // Helpers named expect* (for example expectNoSeriousA11yViolations) count as assertions.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z].*'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='setTimeout']",
          message: 'Static waits are not allowed. Wait for an element or state instead.',
        },
      ],
    },
  },
);
