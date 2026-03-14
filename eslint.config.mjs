import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import compat from 'eslint-plugin-compat';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/jsx-key': 'error',
    },
  },
  // Phase 3A: Browser compatibility — JS API checks on source files (reads .browserslistrc)
  {
    files: ['app/**/*.{js,ts,jsx,tsx}'],
    plugins: { compat },
    rules: {
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
