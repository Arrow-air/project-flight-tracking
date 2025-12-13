#!/usr/bin/env bash
set -euo pipefail

# Always run from repo root
# Find git root - works from anywhere in the repo
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
cd "$REPO_ROOT"

# Show help if requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
  cat <<EOF
Usage: $0 [OPTIONS]

Generate TypeScript types from Supabase database schema.

Options:
  --local, -l              Use .env.local (default)
  --staging, -s            Use .env.staging
  --production, -p         Use .env.production
  --env=ENV, -e=ENV        Use .env.ENV (e.g., --env=development)
  --help, -h               Show this help message

Environment Variables:
  ENV                      Override environment type (e.g., ENV=staging)
  PROJECT_REF              Override Supabase project reference
  OUTPUT_PATH              Override output directory (default: frontend/src/lib)
  OUTPUT_FILE              Override output filename (default: database.types.ts)
  ENV_DIR                  Override env directory (default: config/env)

The script will:
  1. Look for SUPABASE_PROJECT_REF in the specified environment file
  2. Support both plain and dotenvx-encrypted environment files
  3. Generate TypeScript types using the Supabase CLI

Examples:
  $0                      # Use .env.local (default)
  $0 --local              # Explicitly use .env.local
  $0 --staging            # Use .env.staging
  $0 --env=development    # Use .env.development
  ENV=production $0       # Use .env.production via environment variable
EOF
  exit 0
fi

# Parse command line arguments
ENV_TYPE="${ENV:-local}"
if [[ "${1:-}" == "--local" ]] || [[ "${1:-}" == "-l" ]]; then
  ENV_TYPE="local"
elif [[ "${1:-}" == "--staging" ]] || [[ "${1:-}" == "-s" ]]; then
  ENV_TYPE="staging"
elif [[ "${1:-}" == "--production" ]] || [[ "${1:-}" == "-p" ]]; then
  ENV_TYPE="production"
elif [[ "${1:-}" =~ ^--env= ]]; then
  ENV_TYPE="${1#--env=}"
elif [[ "${1:-}" =~ ^-e= ]]; then
  ENV_TYPE="${1#-e=}"
elif [[ -n "${1:-}" ]]; then
  echo "Error: Unknown option '${1:-}'" >&2
  echo "Run '$0 --help' for usage information." >&2
  exit 1
fi

# Allow overriding the output file via OUTPUT_FILE
OUTPUT_PATH="${OUTPUT_PATH:-frontend/src/lib}"
OUTPUT_FILE="${OUTPUT_FILE:-database.types.ts}"

# Environment files are in config/env/ directory
ENV_DIR="${ENV_DIR:-env}"

# Determine which env file to use
if [[ "$ENV_TYPE" == "local" ]]; then
  ENV_FILE="$ENV_DIR/.env.local"
else
  ENV_FILE="$ENV_DIR/.env.$ENV_TYPE"
fi

# Function to read a value from an env file (handles both plain and dotenvx encrypted files)
read_env_value() {
  local file="$1"
  local key="$2"
  local value=""

  if [[ ! -f "$file" ]]; then
    return 1
  fi

  # First, try reading as plain file (works for unencrypted files)
  local line=$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}=" "$file" 2>/dev/null | tail -n1 || true)
  if [[ -n "$line" ]]; then
    value="${line#*=}"
    # Trim surrounding quotes if present
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    # Trim whitespace
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"

    # If we got a value and it doesn't look encrypted (doesn't start with encrypted:), return it
    if [[ -n "$value" ]] && [[ ! "$value" =~ ^encrypted: ]]; then
      echo "$value"
      return 0
    fi
  fi

  # If file appears encrypted or plain read failed, try dotenvx
  # Check if dotenvx CLI is available
  if command -v dotenvx >/dev/null 2>&1 || command -v npx >/dev/null 2>&1; then
    # Try to decrypt and read using dotenvx
    local temp_output=""
    if command -v dotenvx >/dev/null 2>&1; then
      # Use dotenvx run to execute a command that prints the variable
      temp_output=$(dotenvx run --quiet -f "$file" -- printenv "$key" 2>/dev/null || true)
    else
      # Fall back to npx dotenvx
      temp_output=$(npx --yes @dotenvx/dotenvx@latest run --quiet -f "$file" -- printenv "$key" 2>/dev/null || true)
    fi

    if [[ -n "$temp_output" ]]; then
      value="$temp_output"
      # Trim whitespace
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"
      if [[ -n "$value" ]]; then
        echo "$value"
        return 0
      fi
    fi
  fi

  # If we got here, we didn't find the value
  return 1
}

# Load PROJECT_REF from environment, else from the env file
if [[ -z "${PROJECT_REF:-}" ]]; then
  # Try reading from the specified env file
  if PROJECT_REF_VALUE=$(read_env_value "$ENV_FILE" "SUPABASE_PROJECT_REF" 2>/dev/null); then
    export PROJECT_REF="$PROJECT_REF_VALUE"
  else
    # Fallback: try .env.local if we're not already using it
    if [[ "$ENV_TYPE" != "local" ]] && [[ -f "$ENV_DIR/.env.local" ]]; then
      if PROJECT_REF_VALUE=$(read_env_value "$ENV_DIR/.env.local" "SUPABASE_PROJECT_REF" 2>/dev/null); then
        export PROJECT_REF="$PROJECT_REF_VALUE"
      fi
    fi
  fi
fi

if [[ -z "${PROJECT_REF:-}" ]]; then
  echo "Error: SUPABASE_PROJECT_REF is not set." >&2
  echo "  Set it in the environment, or in one of:" >&2
  echo "    - $ENV_FILE" >&2
  if [[ "$ENV_TYPE" != "local" ]]; then
    echo "    - $ENV_DIR/.env.local" >&2
  fi
  echo "" >&2
  echo "Usage: $0 [--local|--staging|--production|--env=ENV]" >&2
  exit 1
fi

echo "Updating database types for project $PROJECT_REF (from $ENV_TYPE environment)"

# Prefer installed CLI if available, otherwise use npx with the latest CLI
if command -v supabase >/dev/null 2>&1; then
  if [[ "$ENV_TYPE" == "local" ]]; then
    supabase gen types --lang=typescript --local > "$OUTPUT_PATH/$OUTPUT_FILE"
  else
    supabase gen types --lang=typescript --project-id "$PROJECT_REF" > "$OUTPUT_PATH/$OUTPUT_FILE"
  fi
else
  # Allow overriding the CLI package (e.g. SUPABASE_CLI_PKG='@supabase/cli@1.187.7')
  SUPABASE_CLI_PKG="${SUPABASE_CLI_PKG:-supabase@latest}"
  npx --yes "$SUPABASE_CLI_PKG" gen types --lang=typescript --project-id "$PROJECT_REF" > "$OUTPUT_PATH/$OUTPUT_FILE"
fi

echo "✓ database.types.ts updated for project $PROJECT_REF (from $ENV_TYPE environment)"

