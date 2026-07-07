import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // RECONCILIATION.md D4, step 2: warn (not error) so new `any` usage is visible
    // in review without failing the build while the existing backlog is triaged.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
