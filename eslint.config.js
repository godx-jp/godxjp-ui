// Self-contained flat ESLint config for @godxjp/ui — no external tooling
// dependency (see docs/DEVELOPMENT.md §5). React 19 + TypeScript.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  // design-sync (claude.ai/design handoff) artifacts — generated bundles/cache (`ds-bundle`,
  // `.ds-sync`, both gitignored) and committed render-snapshots (`.design-sync/previews`); tooling
  // output, not shippable library source, so excluded from lint like `preview`/`.design`/`.ux-audit`.
  { ignores: ["dist/**", "examples/**", "preview/**", "node_modules/**", ".design/**", ".ux-audit/**", "debate/**", "ds-bundle/**", ".ds-sync/**", ".design-sync/**"] },
  // Source carries `-- reason` disable directives for stricter rules (no-deprecated,
  // set-state-in-effect) that this lighter config doesn't enable; keep them as
  // documentation without flagging them unused.
  { linterOptions: { reportUnusedDisableDirectives: "off" } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Source, docs demos, and tooling scripts.
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // TypeScript resolves identifiers; core no-undef is redundant + wrong for TS.
      "no-undef": "off",
      // `_`-prefixed args/vars are intentionally unused (destructure-and-ignore).
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { react: reactPlugin, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      // React 19 / automatic JSX runtime — no React import, no prop-types.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // JP/VN demo copy legitimately contains literal quotes/apostrophes in JSX text;
      // escaping them adds noise and `"`/`'` render fine. Off for the whole repo.
      "react/no-unescaped-entities": "off",
      // Classic, stable hook rules (not react-hooks v7's compiler/purity additions,
      // which would impose new strictness on existing code).
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
