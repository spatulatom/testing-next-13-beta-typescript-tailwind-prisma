import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import compat from 'eslint-plugin-compat';

export default defineConfig([
  ...nextVitals,
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
