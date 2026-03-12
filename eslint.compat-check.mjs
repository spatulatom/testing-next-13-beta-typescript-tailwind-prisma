// Post-build verification config — requires `.next/` output from `npm run build`.
// Used by the `compat:apis` script to check build output for unsupported browser APIs.
import compat from "eslint-plugin-compat";

const config = [{
  files: [".next/static/chunks/**/*.js"],
  plugins: { compat },
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: { "compat/compat": "warn" }
}];

export default config;
