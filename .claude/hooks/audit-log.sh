#!/usr/bin/env bash
set -euo pipefail

input=$(cat)

LOG_DIR=".claude/logs"
mkdir -p "$LOG_DIR"

TS=$(date -Is)
TOOL=$(jq -r '.tool_name // ""' <<< "$input")

# =========================
# command + fallback
# =========================
CMD=$(jq -r '
  .tool_input.command //
  .tool_input.pattern //
  .tool_input.file_path //
  .tool_input.path //
  empty
' <<< "$input" | tr '\n' ' ' | xargs)

# =========================
# target 별도 유지
# =========================
FILE=$(jq -r '
  .tool_input.file_path //
  .tool_input.path //
  empty
' <<< "$input")

# =========================
# 로그
# =========================
jq -n \
  --arg ts "$TS" \
  --arg tool "$TOOL" \
  --arg cmd "$CMD" \
  --arg file "$FILE" \
  '{
    timestamp: $ts,
    tool: $tool,
    command: $cmd,
    target: $file
  }' \
  >> "$LOG_DIR/audit-$(date +%Y-%m-%d).jsonl"

exit 0