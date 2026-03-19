import { defineConfig, type ResolvedConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dotenvx from 'vite-plugin-dotenvx';
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const envDir = path.resolve(__dirname, '../env');
  
  // Build dynamic path array based on mode
  const envPaths = [
    path.resolve(__dirname, envDir, '.env'),             // Base environment variables
    path.resolve(__dirname, envDir, '.env.local'),       // Local development overrides
    path.resolve(__dirname, envDir, `.env.${mode}`),      // Mode-specific environment
    path.resolve(__dirname, envDir, `.env.${mode}.local`),  // Local development overrides
  ].filter(p => {
    // Only include files that exist
    return fs.existsSync(p);
  });

  const envKeysFile = path.resolve(__dirname, envDir, '.env.keys');

  const plugins = [
    vue(),
    dotenvx({
      enabled: true, // default: true
      verbose: true, // default: false, enables detailed logging
      path: envPaths,
      envKeysFile: envKeysFile, // default: '.env.keys'
      overload: true, // default: false

      // Advanced options
      applyInBuild: true, // Want to work in Vercel builds
      exposeToClient: ['VITE_.*', '^VITE_', 'PUBLIC_.*' ],
      ignore: [
        'MISSING_ENV_FILE', // Ignore missing .env files to prevent errors
      ],
      
    }),
    // Custom plugin for security validation
    {
      name: 'validate-no-secrets',
      configResolved(config: ResolvedConfig) {
        // Blacklist of environment variables that should NEVER be exposed to the frontend
        const SECRET_BLACKLIST = [
          'VITE_SUPABASE_SECRET_KEY',
          'VITE_FIREBASE_PRIVATE_KEY',
          'VITE_AUTH0_CLIENT_SECRET',
          'VITE_STRIPE_SECRET_KEY',
          'VITE_DATABASE_PASSWORD',
          'VITE_API_SECRET',
          'VITE_JWT_SECRET',
          'VITE_PRIVATE_KEY',
          'VITE_SECRET_KEY',
          'VITE_ADMIN_KEY',
          'VITE_MASTER_KEY'
        ];

        const violations = [];
        
        for (const secretVar of SECRET_BLACKLIST) {
          const value = config.env?.[secretVar];
          if (value) {
            violations.push(secretVar);
          }
        }

        if (violations.length > 0) {
          throw new Error(
            '\n\n' +
            '🚨 BUILD FAILED - SECURITY VIOLATION 🚨\n' +
            '═'.repeat(50) + '\n' +
            `Secret environment variables detected: ${violations.join(', ')}\n\n` +
            'These secrets would be exposed in the frontend bundle!\n' +
            'This is a critical security issue. Secret keys must NEVER be sent to browsers.\n\n' +
            'Action required:\n' +
            '  1. Remove these variables from all .env* files in config/env/\n' +
            '  2. Keep the non-VITE_ versions for backend use only\n' +
            '  3. Use VITE_ prefixed variables only for safe, public configuration\n\n' +
            'See config/env/.env.example for guidance.\n' +
            '═'.repeat(50) + '\n'
          );
        }
      }
    }
  ];

  // // Debug logging
  // console.log(`\n🔧 Loading environment files for mode: ${mode}`);
  // console.log('Files to load:', envPaths.map(p => path.basename(p)).join(' → '));
  // console.log('='.repeat(50));


  return {
    // envDir: envDir, // Look for environment files in the env directory
    plugins: plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
