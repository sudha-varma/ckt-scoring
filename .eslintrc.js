const fs = require("fs");

const prettierOptions = JSON.parse(fs.readFileSync("./.prettierrc", "utf8"));

module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb-base", "prettier"],
  plugins: ["prettier"],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {},
  },
  rules: {
    "prettier/prettier": ["error", prettierOptions],
    "arrow-body-style": [2, "as-needed"],
    "class-methods-use-this": 0,
    "comma-dangle": [2, "always-multiline"],
    "import/imports-first": 0,
    "import/newline-after-import": 0,
    "import/no-dynamic-require": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-named-as-default": 0,
    "import/no-unresolved": 2,
    "import/no-webpack-loader-syntax": 0,
    "import/prefer-default-export": 0,
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    "max-len": 0,
    "newline-per-chained-call": 0,
    "no-confusing-arrow": 0,
    "no-console": 1,
    "no-use-before-define": 0,
    "require-yield": 0,
    "no-unused-vars": 1,
    "consistent-return": 1,
    "no-param-reassign": 2,
    "no-shadow": 2,
    "no-restricted-globals": 2,
    "no-nested-ternary": 2,
    "prefer-template": 2,
    "no-else-return": 1,
  },
};
