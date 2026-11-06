// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        // Type information, for `no-deprecated` below. The three projects are the ones that
        // between them cover every file in `lintFilePatterns`; the root `tsconfig.json` is
        // solution-style (`files: []`) and does not reference `e2e`, so listing them
        // explicitly is what guarantees no linted file falls outside the program.
        project: ['./tsconfig.app.json', './tsconfig.spec.json', './e2e/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // A deprecated API is invisible to `tsc`: four calls to a deprecated Signal Forms overload
      // sat in the contact form through every gate until an audit read the framework's `.d.ts`.
      // This is the gate that would have caught them. It needs the type information configured
      // above, which is also why `prelint` generates `intlayer-types/` the way `pretypecheck`
      // does - without those declarations the program degrades and the rule goes quiet instead
      // of failing loudly.
      '@typescript-eslint/no-deprecated': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Node ESM tooling (scripts/*.mjs). Angular's rules are template/decorator specific and
    // typescript-eslint's need a TS program, so the core recommended set is the applicable one.
    files: ['**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      // tsconfig.scripts.json type-checks these files against @types/node, which resolves
      // Node's globals properly; leaving no-undef on would need a hand-maintained globals
      // list here to do the same job less well.
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
