/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Périmètre de couverture : à élargir au fur et à mesure que des tests
      // sont ajoutés sur d'autres modules.
      include: [
        'src/config/**/*.ts',
        'src/components/General/Language/LanguageContext.tsx',
        'src/components/Sections/Projects/Data.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
