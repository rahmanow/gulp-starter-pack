import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [".tmp/**", "dist/**", "release/**", "node_modules/**"],
  },

  // Build tooling — runs in Node.
  {
    files: ["gulpfile.js", "config.js", "eslint.config.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },

  // Site code — runs in the browser.
  {
    files: ["src/js/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
  },

  // Vendor bundles are third-party artifacts; don't lint them.
  {
    files: ["src/js/vendor/**/*.js"],
    rules: {},
    linterOptions: { reportUnusedDisableDirectives: false },
  },
];
