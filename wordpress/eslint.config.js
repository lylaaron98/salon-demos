import base from "@salon-demos/config/eslint/base";
import globals from "globals";

/** Vanilla browser scripts shipped by the theme and plugins, plus Node build scripts. */
export default [
  { ignores: ["**/vendor/**", "**/assets/build/**"] },
  ...base,
  {
    files: ["themes/**/assets/js/**/*.js", "plugins/**/assets/js/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser },
    },
  },
];
