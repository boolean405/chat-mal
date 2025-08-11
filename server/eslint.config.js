// eslint.config.js (ESLint v9 flat config)
export default [
  // Which files to lint
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    // JS/Node settings
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Minimal Node globals so ESLint doesn't flag them as undefined
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Pragmatic defaults
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-console": "off", // ok for servers
      "object-shorthand": ["warn", "always"],
    },
  },

  // Ignore stuff
  {
    ignores: ["node_modules", "dist", "coverage"],
  },
];
