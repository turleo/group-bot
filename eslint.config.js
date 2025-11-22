import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.all,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  stylistic.configs.customize({
    indent: 2,
    jsx: false,
    quotes: "double",
    semi: true,
  }),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      "func-style": ["error", "declaration"],
      "no-magic-numbers": ["error", { ignoreArrayIndexes: true }],
      "no-warning-comments": "warn",
      "one-var": ["error", "never"],
      "semi": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "sort-imports": "off",
      "sort-vars": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
          defaultProject: "tsconfig.json",
        },
      },
    },
  },
];
