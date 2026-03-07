import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Global settings ────────────────────────────────────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // ── Project-wide rule overrides ────────────────────────────────────────
  {
    rules: {
      // Allow unused vars prefixed with _ (common pattern for intentional ignores)
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // Allow `any` in type stubs and bridge code (interop with WebView / RN)
      '@typescript-eslint/no-explicit-any': 'warn',

      // Prefer const
      'prefer-const': 'warn',

      // No console.log in library code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── Ignore build output ────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'examples/**'],
  },
);
