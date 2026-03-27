import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import compat from 'eslint-plugin-compat';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      compat,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/jsx-key': 'error',
      'compat/compat': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    'node_modules/**',
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
