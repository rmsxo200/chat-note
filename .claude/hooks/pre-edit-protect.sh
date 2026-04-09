#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
file=$(jq -r '.tool_input.path // .tool_input.file_path // ""' <<< "$input")

# 차단할 파일 패턴 (핵심 보호만 유지)
deny_patterns=(
    "^\.env.*"
    ".*\.key$"
    ".*\.pem$"
    ".*\.secret$"
    "^\.git/.*"
    "^node_modules/.*"
    "^\.aws/.*"
    "^\.ssh/.*"
)

for pattern in "${deny_patterns[@]}"; do
    if echo "$file" | grep -Eq "$pattern"; then
        echo "🛡️ 차단됨: '$file' 파일은 보호 정책에 의해 편집할 수 없습니다." >&2
        exit 2
    fi
done

exit 0