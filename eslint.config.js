import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import prettier from "eslint-config-prettier"
import { defineConfig, globalIgnores } from "eslint/config"

// Fronteira entre módulos: um módulo só enxerga outro pelo index público
// (`@/modules/<mod>`) ou pela camada pura (`@/modules/<mod>/domain`). Alcançar
// `hooks/`, `services/`, `components/`, `pages/` etc. de outro módulo é erro.
// `core` e `auth` são infra transversal — ficam de fora (não geram config aqui).
const BOUNDED_MODULES = [
  "appointment",
  "budget",
  "business",
  "client",
  "dashboard",
  "fiscal",
  "landing",
  "legal",
  "license",
  "location",
  "order",
  "product",
  "settings",
  "supplier",
  "user",
  "vehicle",
  "workservice",
]

const moduleBoundaries = BOUNDED_MODULES.map((mod) => ({
  files: [`src/modules/${mod}/**/*.{js,jsx}`],
  ignores: [`src/modules/${mod}/**/*.test.{js,jsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: `^@/modules/(?!(${mod}|core|auth)/)[^/]+/(?!domain($|/)|index($|/))`,
            message:
              "Import cross-módulo só pelo index público (@/modules/<mod>) ou @/modules/<mod>/domain.",
          },
        ],
      },
    ],
  },
}))

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier, // por último: desliga regras de formatação que conflitam com o Prettier
    ],
    settings: {
      react: { version: "detect" },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // O projeto não usa prop-types (o alvo seria TypeScript, fora de escopo).
      "react/prop-types": "off",
    },
  },
  {
    // Testes: rodam em Node, e o helper de render exporta função (não componente).
    files: ["src/test/**", "**/*.test.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  ...moduleBoundaries,
])
