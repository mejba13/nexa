module.exports = {
  root: true,
  extends: [require.resolve('@nexa/config/eslint/nestjs.js')],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
