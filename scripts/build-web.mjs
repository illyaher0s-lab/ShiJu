import { build } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../apps/web');

console.log('Building web app...');
await build({
  root,
  mode: 'production',
  logLevel: 'info',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
console.log('Build complete');
