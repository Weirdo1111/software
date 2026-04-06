#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/software/english-learn}"
PM2_APP_NAME="${PM2_APP_NAME:-english-learn}"
HOST_HEADER="${HOST_HEADER:-127.0.0.1}"

echo "[deploy-safe] app dir: ${APP_DIR}"
cd "${APP_DIR}"

echo "[deploy-safe] step 1/6: install dependencies"
npm ci

echo "[deploy-safe] step 2/6: prisma migrate deploy"
npx prisma migrate deploy --schema prisma/schema.prisma

echo "[deploy-safe] step 3/6: clean stale next build output"
rm -rf .next

echo "[deploy-safe] step 4/6: build"
npm run build

echo "[deploy-safe] step 5/6: restart pm2"
pm2 restart "${PM2_APP_NAME}" --update-env

echo "[deploy-safe] step 6/6: health checks"
curl -fsS -o /dev/null "http://127.0.0.1:3000/"
curl -fsS -o /dev/null "http://127.0.0.1:3000/api/auth/session"
curl -fsS -o /dev/null "http://${HOST_HEADER}/_next/static/chunks/webpack-2c4ba0dabdd7ed3c.js"

echo "[deploy-safe] done"
