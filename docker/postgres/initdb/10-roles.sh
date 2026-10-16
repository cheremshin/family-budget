#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -v db="$POSTGRES_DB" \
    -v migrate_user="$MIGRATE_DB_USER" -v migrate_pass="$MIGRATE_DB_PASSWORD" \
    -v app_user="$APP_DB_USER" -v app_pass="$APP_DB_PASSWORD" << 'SQL'
CREATE ROLE :"migrate_user" LOGIN PASSWORD :'migrate_pass';
CREATE ROLE :"app_user" LOGIN PASSWORD :'app_pass';

ALTER DATABASE :"db" OWNER TO :"migrate_user";

REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"db" TO :"app_user";

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO :"app_user";

ALTER DEFAULT PRIVILEGES FOR ROLE :"migrate_user" IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migrate_user" IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
SQL
