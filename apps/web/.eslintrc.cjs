module.exports = {
  root: true,
  extends: [require.resolve('@nexa/config/eslint/nextjs.js')],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};
