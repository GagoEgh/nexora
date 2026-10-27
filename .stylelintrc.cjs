/**
 * SCSS rules for src/, enforced by `npm run lint`.
 *
 * The baseline is stylelint-config-standard-scss. Every override below exists because the
 * shared config disagreed with a convention this codebase already follows consistently --
 * each one was measured before being set, and the counts are recorded in the comments.
 * Where the shared config was simply right, nothing is overridden.
 *
 * Prettier owns whitespace in this repo (`npm run format:check` covers .scss), so the
 * blank-line rules are off rather than adding a second, conflicting formatter opinion.
 *
 * Coverage gap: stylelint only sees .scss files. Seven page components keep a five-line
 * inline `styles:` block in their .ts (six are `@include container.page()`, home.ts is
 * `display: block`). Those are not linted. Grepping only *.scss once led to `page()` being
 * misreported as dead code, so when auditing mixin or token usage, search .ts as well.
 */
module.exports = {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['**/node_modules/**', 'dist/**', '.angular/**'],
  rules: {
    // Flat BEM: block[__element][--modifier], every segment kebab-case. All 363 class
    // names in src/ already match this, including third-party blocks (.mat-*, .cdk-*),
    // so the pattern is tight enough to catch a genuine deviation rather than noise.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Expected class to be flat BEM: block[__element][--modifier], each segment ' +
          'kebab-case (e.g. .overview__card--featured)',
      },
    ],

    // A leading underscore marks a member private to its file ($_palettes, @mixin _role).
    // The shared config's kebab-case pattern rejects it; the convention is deliberate.
    'scss/dollar-variable-pattern': [
      '^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected $variable to be kebab-case, optionally prefixed with _ when private' },
    ],
    'scss/at-mixin-pattern': [
      '^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected mixin to be kebab-case, optionally prefixed with _ when private' },
    ],

    // 138 of 138 hex literals in src/ are six-digit, because the Material tonal palettes in
    // theme/_theme-colors.scss read as aligned columns. Enforce that instead of shortening
    // #ffffff to #fff in the middle of a palette.
    'color-hex-length': 'long',

    // 37 of 37 argumentless mixin calls are written `@include container.section();`. The
    // shared config wants them bare; enforce the house style so the odd one out is caught.
    'scss/at-mixin-argumentless-call-parentheses': 'always',

    // `currentColor` is the spelling the CSS spec itself uses, and `Inter` is a font family
    // name that the rule misreads as a keyword -- lowercasing either would be wrong. Other
    // miscased keywords (display: BLOCK) are still reported.
    'value-keyword-case': ['lower', { ignoreKeywords: ['currentColor', 'Inter'] }],

    // Whitespace only, no defect-catching power, and Prettier already runs over .scss.
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/double-slash-comment-empty-line-before': null,

    // Added, not inherited: held at zero across src/ when audited by hand. These turn that
    // one-off check into a standing one.
    //
    // stylelint-config-standard-scss switches `no-duplicate-selectors` off, because `&`
    // nesting makes it awkward in Sass. It is back on here because its absence let nine
    // duplicated selectors through review in the hero and home styles: animation blocks were
    // appended to files instead of extending the rules already there, which made source order
    // load-bearing for no reason.
    'no-duplicate-selectors': true,
    'declaration-no-important': true,
    'selector-disallowed-list': [
      ['/::ng-deep/', '//deep//', '/>>>/'],
      {
        message:
          'Shadow-piercing selectors are removed from the platform and leak styles out of ' +
          'the component. Expose a CSS custom property instead.',
      },
    ],
  },
};
