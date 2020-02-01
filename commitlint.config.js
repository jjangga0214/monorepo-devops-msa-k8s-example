module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 100], // corresponding to maxHeaderWidth of commitizen
    'subject-case': [1, 'always', 'lowerCase'],
  },
}
