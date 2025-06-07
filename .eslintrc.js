/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Add this line
  },
  extends: 'eslint:recommended',
  rules: {
    'no-undef': 'error',
  },
};
