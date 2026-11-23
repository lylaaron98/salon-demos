// Shared ESLint flat config for React component libraries (no Next.js rules).
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import base from "./base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base.slice(0, -1),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  // Must stay last: turns off rules that conflict with Prettier.
  base.at(-1),
];
