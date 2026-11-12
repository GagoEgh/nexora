module.exports = {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['**/node_modules/**', 'dist/**', '.angular/**'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Expected class to be flat BEM: block[__element][--modifier], each segment ' +
          'kebab-case (e.g. .overview__card--featured)',
      },
    ],

    'scss/dollar-variable-pattern': [
      '^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected $variable to be kebab-case, optionally prefixed with _ when private' },
    ],
    'scss/at-mixin-pattern': [
      '^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      { message: 'Expected mixin to be kebab-case, optionally prefixed with _ when private' },
    ],

    'color-hex-length': 'long',
    'scss/at-mixin-argumentless-call-parentheses': 'always',
    'value-keyword-case': ['lower', { ignoreKeywords: ['currentColor', 'Inter'] }],
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/double-slash-comment-empty-line-before': null,
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
