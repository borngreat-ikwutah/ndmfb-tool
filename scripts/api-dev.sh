#!/usr/bin/env bash

set -u

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
api_dir="$repo_root/apps/api"
binary_dir="${TMPDIR:-/tmp}/ndmfb-api-dev"
binary_path="$binary_dir/api"

mkdir -p "$binary_dir"

cleanup() {
  if [ -n "${api_pid:-}" ]; then
    kill "$api_pid" 2>/dev/null || true
    wait "$api_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

file_signature() {
  find "$api_dir" -type f \( -name '*.go' -o -name '*.sql' -o -name 'go.mod' -o -name 'go.sum' -o -name '.env' \) -print0 \
    | sort -z \
    | xargs -0 stat -c '%n %Y %s' 2>/dev/null \
    | sha256sum \
    | awk '{print $1}'
}

build_api() {
  echo "Building API..."
  if ! (cd "$api_dir" && go build -o "$binary_path" ./cmd/api); then
    echo "API build failed. Waiting for the next change."
    return 1
  fi
  return 0
}

while true; do
  before="$(file_signature)"
  if build_api; then
    echo "Starting API on http://localhost:${API_PORT:-8080}"
    "$binary_path" &
    api_pid=$!
  else
    api_pid=""
  fi

  while true; do
    sleep 1
    after="$(file_signature)"
    if [ "$before" != "$after" ]; then
      echo "API files changed. Restarting..."
      cleanup
      api_pid=""
      break
    fi
    if [ -n "${api_pid:-}" ] && ! kill -0 "$api_pid" 2>/dev/null; then
      wait "$api_pid" 2>/dev/null || true
      api_pid=""
      break
    fi
  done
done
