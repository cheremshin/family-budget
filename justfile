set dotenv-load := false
set lazy := true
set shell := ["bash", "-euo", "pipefail", "-c"]

sha := `git describe --always --dirty 2>/dev/null || echo unknown`

# Сеть для сборки образов. По умолчанию — изолированная сеть Docker.
# BUILD_NETWORK=host — сборка через сетевой стек хоста (нужно за TUN-прокси, например Throne).
# Это настройка машины: задаётся в окружении (~/.zshrc), а не в репозитории.
build_network := env("BUILD_NETWORK", "")
build_net_flags := if build_network == "host" { "--network host --allow network.host" } else { "" }

[private]
default:
    @just --list

db:
    docker compose up -d

dev: db
    scripts/with-db-env.sh app pnpm dev

migrate: db
    scripts/with-db-env.sh migrate pnpm --filter @family-budget/database db:migrate

generate:
    scripts/with-db-env.sh migrate pnpm --filter @family-budget/database db:generate

studio: db
    scripts/with-db-env.sh migrate pnpm --filter @family-budget/database db:studio

build:
    docker buildx build {{build_net_flags}} --target migrate \
        -t family-budget-migrate:{{sha}} -t family-budget-migrate:latest .
    docker buildx build {{build_net_flags}} --target runner --build-arg GIT_SHA={{sha}} \
        -t family-budget-web:{{sha}} -t family-budget-web:latest .

prod-up: _confirm-dirty build db-backup
    IMAGE_TAG={{sha}} docker compose --profile app up -d --no-build

rollback tag:
    IMAGE_TAG={{tag}} docker compose --profile app up -d --no-build web

prod-down:
    docker compose --profile app down

logs service="web":
    docker compose logs -f --tail=200 {{service}}

health:
    curl -s localhost:3001/api/health/live && echo && curl -si localhost:3001/api/health/ready

db-backup keep="14":
    #!/usr/bin/env bash
    set -euo pipefail
    umask 077
    mkdir -p backups && chmod 700 backups
    docker compose up -d --wait postgres
    f="backups/$(date +%Y-%m-%d_%H-%M-%S).dump"
    trap 'rm -f "$f.tmp"' EXIT
    docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$f.tmp"
    mv "$f.tmp" "$f"
    ls -1t backups/*.dump | tail -n +$(( {{keep}} + 1 )) | xargs -r rm --
    ls -lh "$f"

[confirm("Текущие данные БД будут заменены дампом. Продолжить?")]
db-restore file:
    test -f {{quote(file)}}
    docker compose --profile app stop web
    docker compose up -d --wait postgres
    docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --role "$MIGRATE_DB_USER" --clean --if-exists --no-owner --single-transaction' < {{quote(file)}}
    docker compose --profile app up -d --no-build web

[confirm("Удалить volume с данными БД?")]
db-reset:
    docker compose --profile app down -v

db-copy name="family_budget_dev":
    #!/usr/bin/env bash
    set -euo pipefail
    just db-backup
    f="$(ls -1t backups/*.dump | head -1)"
    pg() { docker compose exec -T -e NAME={{name}} postgres sh -euc "$1"; }
    pg 'dropdb -U "$POSTGRES_USER" --if-exists "$NAME"'
    pg 'createdb -U "$POSTGRES_USER" -O "$MIGRATE_DB_USER" "$NAME"'
    pg 'psql -U "$POSTGRES_USER" -d "$NAME" -v ON_ERROR_STOP=1 -v db="$NAME" \
        -v migrate_user="$MIGRATE_DB_USER" -v app_user="$APP_DB_USER"' \
        < docker/postgres/database-grants.sql
    pg 'pg_restore -U "$POSTGRES_USER" -d "$NAME" --role "$MIGRATE_DB_USER" \
        --no-owner --single-transaction' < "$f"
    echo "готово: DB_NAME={{name}} just dev"

[private]
_confirm-dirty:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ "{{sha}}" == *-dirty ]]; then
        read -rp "Рабочее дерево грязное ({{sha}}). Продолжить? [y/N] " a
        [[ "$a" == y ]] || exit 1
    fi
