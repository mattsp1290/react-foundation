import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const fromCatalog = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

// The catalog renders the package sources directly, under the specifiers a
// consumer would write.
export default defineConfig({
  root: fromCatalog('.'),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@birb\/react-foundation\/(tokens|base)\.css$/,
        replacement: fromCatalog('../css/$1.css'),
      },
      {
        find: /^@birb\/react-foundation$/,
        replacement: fromCatalog('../src/index.ts'),
      },
    ],
  },
  server: { fs: { allow: ['..'] } },
});
