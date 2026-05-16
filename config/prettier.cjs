// @godxjp/ui — shared Prettier config.
//
// Consume in a service frontend:
//   // .prettierrc.json → "prettier": "@godxjp/ui/prettier-config"
//   // or package.json: "prettier": "@godxjp/ui/prettier-config"

/** @type {import("prettier").Config} */
module.exports = {
  semi: false,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  // Tailwind class sorting — service must install prettier-plugin-tailwindcss separately.
  plugins: [],
}
