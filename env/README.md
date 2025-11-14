# Environment Configuration

This directory contains environment configuration files for the brush-targeting application. The environment files are organized by deployment stage and contain sensitive configuration data.

## File Structure

```
env/
├── .env.example          # Template file with example values
├── .env                  # Base environment variables (committed)
├── .env.local            # Local development overrides (gitignored)
├── .env.staging          # Staging environment (encrypted, committed)
├── .env.production       # Production environment (encrypted, committed)
├── .env.keys             # Encryption keys for dotenvx (gitignored)
└── .gitignore            # Git ignore rules for sensitive files
```

## Environment File Hierarchy

Environment files are loaded in the following order (later files override earlier ones):

1. `.env` - Base configuration
2. `.env.local` - Local development overrides
3. `.env.staging` - Staging environment (when `NODE_ENV=staging`)
4. `.env.production` - Production environment (when `NODE_ENV=production`)

## Usage

### Local Development

1. **Copy the example file:**
   ```bash
   cp env/.env.example env/.env.local
   ```

2. **Edit `.env.local` with your local values:**
   ```bash
   # Supabase Configuration
   SUPABASE_PROJECT_REF=your_project_id
   SUPABASE_API_URL=http://127.0.0.1:54321
   SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   SUPABASE_SECRET_KEY=your_secret_key

   # Frontend Configuration
   VITE_REST_API_URL=http://localhost:8000
   VITE_SUPABASE_API_URL=http://127.0.0.1:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

3. **Encrypt environment files before committing:**
   ```bash
   # Install dotenvx if not already installed
   npm install -g dotenvx
   
   # Encrypt staging environment file
   dotenvx encrypt -f env/.env.staging -k env/.env.keys
   
   # Encrypt production environment file
   dotenvx encrypt -f env/.env.production -k env/.env.keys
   ```
   
   > **Note:** Always encrypt `.env.staging` and `.env.production` files before committing them to version control. The `.env.keys` file should remain in `.gitignore` and never be committed.

4. **Start the development server:**
   ```bash
   cd frontend
   yarn dev
   ```

### Frontend Integration

The frontend is configured to automatically load environment files from this directory:

```typescript
// vite.config.ts
export default defineConfig({
  envDir: path.resolve(__dirname, '../env'),
  // ...
});
```

### Backend Integration

The backend loads environment variables from this directory using dotenv:

```python
# backend/config.py
from dotenv import load_dotenv
import os

# Load from 'env' directory
load_dotenv('env/.env')
load_dotenv('env/.env.local')
```

## Security Notes

- **Never commit sensitive data** like API keys, passwords, or secrets
- **Use dotenvx encryption** for production and staging environments
- **Keep `.env.local` in .gitignore** for local development overrides
- **Use environment-specific files** (`.env.staging`, `.env.production`) for deployments

## Environment Variables

### Required Variables

- `SUPABASE_PROJECT_REF` - Your Supabase project reference ID
- `SUPABASE_API_URL` - Supabase API endpoint URL
- `SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `SUPABASE_SECRET_KEY` - Supabase secret key
- `VITE_REST_API_URL` - Backend API URL for frontend
- `VITE_SUPABASE_API_URL` - Supabase URL for frontend
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key for frontend

### Optional Variables

- `SUPABASE_JWT_SECRET` - JWT secret for Supabase (deprecated)
- `SUPABASE_ANON_KEY` - Anonymous key for Supabase 
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for Supabase (deprecated)

## Troubleshooting

### Environment Variables Not Loading

1. **Check file paths:** Ensure environment files are in `env/`
2. **Verify gitignore:** Make sure `.env.local` is not committed
3. **Check Vite config:** Ensure `envDir` points to `../env`
4. **Restart dev server:** Environment changes require a restart

### Missing Environment Variables

1. **Check .env.local:** Ensure local overrides are properly set
2. **Verify variable names:** Use exact variable names (case-sensitive)
3. **Check file permissions:** Ensure files are readable
4. **Review console logs:** Check for environment loading errors

## Deployment

For production deployments:

1. **Use encrypted environment files** (`.env.production`, `.env.staging`)
2. **Set appropriate NODE_ENV** values
3. **Ensure encryption keys** are available in deployment environment
4. **Verify all required variables** are set

## Contributing

When adding new environment variables:

1. **Update `.env.example`** with the new variable
2. **Document the variable** in this README
3. **Add to appropriate environment files** as needed
4. **Test locally** with `.env.local` overrides
