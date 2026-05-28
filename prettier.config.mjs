// Self-contained Prettier config for @godxjp/ui — no external tooling
// dependency (see docs/DEVELOPMENT.md §5). Tailwind class sorting via plugin.
/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
};
