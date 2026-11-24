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
    rules: {
      // Shipped without a build step as ES5-style prototypes, where `var self = this` is idiomatic.
      "@typescript-eslint/no-this-alias": "off",
    },
  },
];
