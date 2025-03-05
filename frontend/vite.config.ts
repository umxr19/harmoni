import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow connections from all network interfaces
    port: 5173,      // Specify port explicitly
    proxy: {
      '/api': {
        target: 'http://192.168.1.67:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      // Ensure all imports of React use the same instance
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Force Vite to bundle these dependencies with the same React instance
    force: true,
  },
  build: {
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Generate sourcemaps for production
    sourcemap: false,
    // Optimize output
    rollupOptions: {
      output: {
        // Chunk files by type
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['react-icons'],
        },
        // Ensure chunks are properly named
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Ensure assets are properly processed
    assetsInlineLimit: 4096, // 4kb
  },
  // CSS optimization
  css: {
    // Enable CSS modules
    modules: {
      localsConvention: 'camelCase',
    },
    // Minify CSS
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
          }],
        }),
      ],
    },
  },
})
