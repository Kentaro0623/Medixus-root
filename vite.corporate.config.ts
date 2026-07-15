import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// コーポレートサイト(Medixus-HP)の /demo/ 配下に同梱するためのビルド設定
export default defineConfig({
  plugins: [react()],
  base: '/demo/',
  build: {
    outDir: 'dist-corporate',
    rollupOptions: { input: resolve(__dirname, 'demo.html') },
  },
});
