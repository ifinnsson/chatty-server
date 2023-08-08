module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "none",
  bracketSpacing: false,
  bracketSameLine: false,
  jsxBracketSameLine: false,
  arrowFunctionParentheses: "always",
  arrowParens: "always",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: [
    "react", // React
    "^react-.*$", // React-related imports
    "^next", // Next-related imports
    "^next-.*$", // Next-related imports
    "^next/.*$", // Next-related imports
    "^.*/hooks/.*$", // Hooks
    "^.*/services/.*$", // Services
    "^.*/utils/.*$", // Utils
    "^.*/types/.*$", // Types
    "^.*/pages/.*$", // Components
    "^.*/components/.*$", // Components
    "^[./]", // Other imports
    ".*" // Any uncaught imports
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true
}
