// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript","prettier"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
}, ...storybook.configs["flat/recommended"], {
  // Module boundaries. A module's repository is private: within the module it
  // is imported relatively (`./post.repository`), and other modules go through
  // that module's service. The alias form is therefore always a boundary break.
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        {
          group: ["@modules/*/*.repository", "**/modules/*/*.repository", "../*/*.repository"],
          message: "Repositories are private to their module. Call the owning module's service instead.",
        },
        {
          group: ["@controllers/*", "@services/*", "@repositories/*", "@dtos/*", "@models/*"],
          message: "Layer folders were replaced by src/modules/<domain>/. Import from @modules/<domain>/<file>.",
        },
      ],
    }],
  },
}, {
  // The composition root is the one place allowed to see every repository.
  files: ["src/lib/di/registry.ts"],
  rules: { "no-restricted-imports": "off" },
}];

export default eslintConfig;
