#!/usr/bin/env bash
set -euo pipefail

# Always run from repo root
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Allow overriding the env file via ENV_FILE
ENV_FILE="${ENV_FILE:-.env}"

# Allow overriding the output file via OUTPUT_FILE
OUTPUT_PATH="${OUTPUT_PATH:-frontend/src/lib}"
OUTPUT_FILE="${OUTPUT_FILE:-database.types.ts}"

# Load PROJECT_REF from environment, else from the env file
if [[ -z "${PROJECT_REF:-}" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    # Match lines like: PROJECT_REF=xxx or export PROJECT_REF=xxx (ignore comments)
    line=$(grep -E '^[[:space:]]*(export[[:space:]]+)?PROJECT_REF=' "$ENV_FILE" | tail -n1 || true)
    if [[ -n "$line" ]]; then
      value="${line#*=}"
      # Trim surrounding quotes if present
      value="${value%\"}"
      value="${value#\"}"
      value="${value%\'}"
      value="${value#\'}"
      export PROJECT_REF="$value"
    fi
  fi
fi

if [[ -z "${PROJECT_REF:-}" ]]; then
  echo "Error: PROJECT_REF is not set. Set it in the environment or in $ENV_FILE as PROJECT_REF=your_ref" >&2
  exit 1
fi

# Prefer installed CLI if available, otherwise use npx with the latest CLI
if command -v supabase >/dev/null 2>&1; then
  supabase gen types --lang=typescript --project-id "$PROJECT_REF" > "$OUTPUT_PATH/$OUTPUT_FILE"
else
  # Allow overriding the CLI package (e.g. SUPABASE_CLI_PKG='@supabase/cli@1.187.7')
  SUPABASE_CLI_PKG="${SUPABASE_CLI_PKG:-supabase@latest}"
  npx --yes "$SUPABASE_CLI_PKG" gen types --lang=typescript --project-id "$PROJECT_REF" > "$OUTPUT_PATH/$OUTPUT_FILE"
fi

echo "database.types.ts updated for project $PROJECT_REF"

