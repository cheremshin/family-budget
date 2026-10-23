#!/usr/bin/env bash
set -euo pipefail

role="${1:?usage: scripts/with-db-env.sh <app|migrate> <command...>}"
shift

source ./.env

case "$role" in
    app)
        db_user="$APP_DB_USER"
        db_pass="$APP_DB_PASSWORD"
        export SESSION_SECRET
        ;;
    migrate)
        db_user="$MIGRATE_DB_USER"
        db_pass="$MIGRATE_DB_PASSWORD"
        ;;
    *)
        echo "with-db-env.sh: неизвестная роль '$role' (ожидается app или migrate)" >&2
        exit 2
        ;;
esac

db_name="${DB_NAME:-$POSTGRES_DB}"

export DATABASE_URL="postgres://${db_user}:${db_pass}@localhost:${POSTGRES_PORT:-5432}/${db_name}"
exec "$@"
