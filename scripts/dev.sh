#!/usr/bin/env bash
set -euo pipefail

npm run dev:frontend &
frontend_pid=$!

npm run dev:cms &
cms_pid=$!

trap 'kill $frontend_pid $cms_pid' EXIT
wait
