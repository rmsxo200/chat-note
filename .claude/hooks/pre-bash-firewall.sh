#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<< "$input")

# 공백 normalize (다중 공백으로 패턴 우회 방지)
normalized=$(echo "$command" | tr -s ' ')

# ──────────────────────────────────────
# 위험 명령 차단 (regex 기반)
# ──────────────────────────────────────
if echo "$normalized" | grep -Eiq \
  '(rm\s+-rf|rm\s+-r\s+/|git\s+push\s+--force|git\s+push\s+-f|git\s+reset\s+--hard|git\s+remote\s+(add|set-url)|chmod\s+777|mkfs|dd\s+if=|:\(\)\{.*\}\s*;)' ; then
    echo "🚫 차단됨: 위험한 명령 패턴 감지" >&2
    exit 2
fi

# ──────────────────────────────────────
# 민감 파일 접근 차단
# ──────────────────────────────────────
if echo "$command" | grep -Eiq \
  '(\.env|\.ssh|\.aws|credentials|secrets/|\.key|\.pem|id_rsa)'; then
    echo "🔒 차단됨: 민감 파일 접근 감지" >&2
    exit 2
fi

# ──────────────────────────────────────
# 네트워크 도구 차단 (파이프·세미콜론 우회 방지)
# ──────────────────────────────────────
if echo "$command" | grep -Eiq \
  '(^|[|;&])\s*(curl|wget|nc|ncat|netcat|nmap|ssh|scp|sftp)\s|(\$\(|`)\s*(curl|wget|nc|ncat|netcat|nmap|ssh|scp|sftp)\s|(^|[^a-zA-Z0-9_])(curl|wget|nc|ncat|netcat|nmap|ssh|scp|sftp)([^a-zA-Z0-9_]|$)'; then
    echo "🌐 차단됨: 네트워크 도구 사용 금지" >&2
    exit 2
fi

exit 0