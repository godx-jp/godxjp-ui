// @godxjp/ui — shared ESLint flat config.
//
// Consume in a service frontend with a single line:
//
//   // eslint.config.js
//   export { default } from "@godxjp/ui/eslint-config"
//
// Locked stack (new-docs/12 §9):
//   ESLint 9.x + typescript-eslint 8.x (strict + stylistic)
//   eslint-plugin-react 7.x + eslint-plugin-react-hooks 5.x
//   eslint-plugin-jsx-a11y 6.x (WCAG 2.1 AA in JSX)
//   eslint-config-prettier (turns off formatting conflicts)
//
// This file is intentionally kept dependency-free at the @godxjp/ui level
// so it can be consumed before peerDependencies install. The locked rule
// sets above are declared as peerDependencies by the consumer's package.json;
// when a service uses the umbrella workspace those peers resolve automatically.

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    // Global ignores — applies before any rules.
    ignores: ["dist/**", "node_modules/**", "*.d.ts"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // React 19 does not require the React import for JSX.
      "react/react-in-jsx-scope": "off",
      // Always exhaustive deps.
      "react-hooks/exhaustive-deps": "warn",
      // Accessibility baseline.
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      // No console in production code.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]

export default config
