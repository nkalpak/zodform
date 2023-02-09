import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: './dist',
    lib: {
      entry: path.resolve('index.ts'),
      name: '@zodform/mantine',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@emotion/react', '@zodform/core']
    }
  }
});
