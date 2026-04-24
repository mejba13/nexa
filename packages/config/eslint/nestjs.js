/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: false,
  extends: [require.resolve('./base.js')],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
