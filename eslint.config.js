import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "node_modules"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // New compiler-powered rules in eslint-plugin-react-hooks v7 flag six
      // pre-existing effect patterns; adopting them is tracked separately so
      // the eslint-10 peer fix stays mechanical.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ]
    }
  },
  {
    // Tests and Node-side config run in a Node environment.
    files: ["tests/**/*.{ts,tsx}", "*.config.{ts,js}"],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
);
