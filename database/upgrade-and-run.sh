#!/bin/bash
set -e

# If running as root, ensure postgres ownership and re-execute as postgres user
if [ "$(id -u)" = '0' ]; then
    chown -R postgres:postgres /var/lib/postgresql 2>/dev/null || true
    exec gosu postgres "$BASH_SOURCE" "$@"
fi

# In OpenShift, containers run with an arbitrary UID that may not be in /etc/passwd.
# Ensure the current effective UID resolves so initdb and pg_upgrade do not fail.
if ! getent passwd "$(id -u)" >/dev/null 2>&1; then
    if [ -w /etc/passwd ]; then
        echo "postgres:x:$(id -u):0:PostgreSQL,,,:/var/lib/postgresql:/bin/bash" >> /etc/passwd
    else
        NSS_DIR="/tmp/nss_wrapper"
        mkdir -p "$NSS_DIR"
        cp /etc/passwd "$NSS_DIR/passwd" 2>/dev/null || true
        echo "postgres:x:$(id -u):0:PostgreSQL,,,:/var/lib/postgresql:/bin/bash" >> "$NSS_DIR/passwd"
        export NSS_WRAPPER_PASSWD="$NSS_DIR/passwd"
        export NSS_WRAPPER_GROUP="/etc/group"
        NSS_LIB=$(find /usr/lib -name 'libnss_wrapper.so*' 2>/dev/null | head -n 1)
        if [ -n "$NSS_LIB" ]; then
            export LD_PRELOAD="${LD_PRELOAD:+${LD_PRELOAD}:}$NSS_LIB"
        fi
    fi
fi

NEW_PGDATA="${PGDATA:-/var/lib/postgresql/data}"
export PGDATA="$NEW_PGDATA"

OLD_CLUSTER_DIR=""
OLD_VERSION=""

# 1. First check if an earlier migration was interrupted / left unfinished in data.v*
# This takes precedence over checking $NEW_PGDATA/PG_VERSION so an incomplete PostgreSQL 18
# cluster left by an interrupted pg_upgrade does not prevent resuming the migration.
for d in /var/lib/postgresql/data.v*; do
    if [ -d "$d" ] && [[ "$d" != *.bak* ]] && [ -s "$d/PG_VERSION" ]; then
        V=$(cat "$d/PG_VERSION")
        if [ "$V" != "18" ]; then
            echo "Found unfinished migration in $d (source version $V)."
            OLD_CLUSTER_DIR="$d"
            OLD_VERSION="$V"
            break
        fi
    fi
done

# 2. Check if legacy docker-compose /pgdata volume contains a cluster
if [ -z "$OLD_CLUSTER_DIR" ] && [ -s "/pgdata/PG_VERSION" ]; then
    V=$(cat "/pgdata/PG_VERSION")
    if [ "$V" != "18" ]; then
        echo "Detected PostgreSQL $V in legacy /pgdata volume."
        OLD_DIR="/var/lib/postgresql/data.v${V}"
        mkdir -p "$OLD_DIR"
        find /pgdata -maxdepth 1 -mindepth 1 ! -name "lost+found" -exec cp -a -t "$OLD_DIR" {} +
        OLD_CLUSTER_DIR="$OLD_DIR"
        OLD_VERSION="$V"
    fi
fi

# 3. Check if PG_VERSION exists directly in /var/lib/postgresql
if [ -z "$OLD_CLUSTER_DIR" ] && [ -s "/var/lib/postgresql/PG_VERSION" ]; then
    V=$(cat "/var/lib/postgresql/PG_VERSION")
    if [ "$V" != "18" ]; then
        echo "Detected PostgreSQL $V directly in /var/lib/postgresql."
        # Relocate all files into a subfolder except PG_VERSION first, so an interrupted
        # relocation can safely resume through this root-directory branch on next startup
        OLD_DIR="/var/lib/postgresql/data.v${V}"
        mkdir -p "$OLD_DIR"
        find /var/lib/postgresql -maxdepth 1 -mindepth 1 \
            ! -name "data.v${V}" \
            ! -name "18" \
            ! -name "data" \
            ! -name "lost+found" \
            ! -name "PG_VERSION" \
            -exec mv -t "$OLD_DIR" {} +
        # Move PG_VERSION last only after all other entries have moved successfully
        mv /var/lib/postgresql/PG_VERSION "$OLD_DIR/PG_VERSION"
        OLD_CLUSTER_DIR="$OLD_DIR"
        OLD_VERSION="$V"
    fi
fi

# 4. Check if PG_VERSION exists in /var/lib/postgresql/userdata (OpenShift SCL PostgreSQL container default)
if [ -z "$OLD_CLUSTER_DIR" ] && [ -s "/var/lib/postgresql/userdata/PG_VERSION" ]; then
    V=$(cat "/var/lib/postgresql/userdata/PG_VERSION")
    if [ "$V" != "18" ]; then
        echo "Detected PostgreSQL $V in /var/lib/postgresql/userdata."
        OLD_DIR="/var/lib/postgresql/data.v${V}"
        mv /var/lib/postgresql/userdata "$OLD_DIR"
        OLD_CLUSTER_DIR="$OLD_DIR"
        OLD_VERSION="$V"
    fi
fi

# 5. Check if PG_VERSION exists in /var/lib/postgresql/data (default in PostgreSQL 13 container)
if [ -z "$OLD_CLUSTER_DIR" ] && [ -s "/var/lib/postgresql/data/PG_VERSION" ]; then
    V=$(cat "/var/lib/postgresql/data/PG_VERSION")
    if [ "$V" != "18" ]; then
        echo "Detected PostgreSQL $V in /var/lib/postgresql/data."
        OLD_DIR="/var/lib/postgresql/data.v${V}"
        mkdir -p "$OLD_DIR"
        # If /var/lib/postgresql/data is an active mountpoint, move its contents to avoid "Device or resource busy"
        if mountpoint -q /var/lib/postgresql/data 2>/dev/null || grep -qs '/var/lib/postgresql/data ' /proc/mounts 2>/dev/null; then
            find /var/lib/postgresql/data -maxdepth 1 -mindepth 1 -exec mv -t "$OLD_DIR" {} +
        else
            mv /var/lib/postgresql/data "$OLD_DIR"
        fi
        OLD_CLUSTER_DIR="$OLD_DIR"
        OLD_VERSION="$V"
    fi
fi

if [ -n "$OLD_CLUSTER_DIR" ] && [ -n "$OLD_VERSION" ]; then
    # OpenShift SCL PostgreSQL 12 installation superuser was strictly 'postgres'.
    # PostgreSQL 13 (e.g. docker-compose) may have been initialized with custom $POSTGRES_USER.
    if [ "$OLD_VERSION" = "12" ]; then
        MIGRATION_SUPERUSER="postgres"
    else
        MIGRATION_SUPERUSER="${POSTGRES_USER:-postgres}"
    fi

    echo "=========================================================="
    echo "Initiating automated upgrade from PostgreSQL $OLD_VERSION to 18..."
    echo "Source: $OLD_CLUSTER_DIR"
    echo "Target: $NEW_PGDATA"
    echo "Migration Superuser: $MIGRATION_SUPERUSER"
    echo "=========================================================="

    OLD_BIN="/usr/lib/postgresql/${OLD_VERSION}/bin"
    NEW_BIN="/usr/lib/postgresql/18/bin"

    if [ ! -x "$OLD_BIN/postgres" ]; then
        echo "ERROR: PostgreSQL $OLD_VERSION binaries not found at $OLD_BIN!" >&2
        exit 1
    fi

    # Determine checksum settings of old cluster
    CHECKSUM_VAL=$("$OLD_BIN/pg_controldata" "$OLD_CLUSTER_DIR" | grep "Data page checksum version" | awk '{print $NF}')
    INITDB_CHECKSUM_ARG="--no-data-checksums"
    if [ "$CHECKSUM_VAL" = "1" ]; then
        INITDB_CHECKSUM_ARG="--data-checksums"
    fi
    echo "Preserving checksum setting: $INITDB_CHECKSUM_ARG"

    # Helper to restore source cluster's original configuration files on failure or before archiving
    restore_old_cluster_configs() {
        if [ -n "$OLD_CLUSTER_DIR" ] && [ -d "$OLD_CLUSTER_DIR" ]; then
            if [ -f "$OLD_CLUSTER_DIR/pg_hba.conf.orig" ]; then
                cp -p "$OLD_CLUSTER_DIR/pg_hba.conf.orig" "$OLD_CLUSTER_DIR/pg_hba.conf"
                rm -f "$OLD_CLUSTER_DIR/pg_hba.conf.orig"
            fi
            if [ -f "$OLD_CLUSTER_DIR/postgresql.conf.orig" ]; then
                cp -p "$OLD_CLUSTER_DIR/postgresql.conf.orig" "$OLD_CLUSTER_DIR/postgresql.conf"
                rm -f "$OLD_CLUSTER_DIR/postgresql.conf.orig"
            fi
        fi
    }
    # Ensure source cluster configs are restored if any unexpected error terminates the script
    trap restore_old_cluster_configs ERR

    # OpenShift SCL PostgreSQL 12 postgresql.conf references files outside the volume
    # such as /var/lib/pgsql/openshift-custom-postgresql.conf or $HOME/openshift-custom-postgresql.conf.
    # Comment out all include directives in the old cluster's postgresql.conf so pg_upgrade can cleanly start it.
    if [ -f "$OLD_CLUSTER_DIR/postgresql.conf" ]; then
        if [ ! -f "$OLD_CLUSTER_DIR/postgresql.conf.orig" ]; then
            cp -p "$OLD_CLUSTER_DIR/postgresql.conf" "$OLD_CLUSTER_DIR/postgresql.conf.orig"
        fi
        sed -i -E "s/^[[:space:]]*include/# &/" "$OLD_CLUSTER_DIR/postgresql.conf"
    fi

    # Ensure pg_upgrade can connect locally without password authentication
    if [ -f "$OLD_CLUSTER_DIR/pg_hba.conf" ]; then
        if [ ! -f "$OLD_CLUSTER_DIR/pg_hba.conf.orig" ]; then
            cp -p "$OLD_CLUSTER_DIR/pg_hba.conf" "$OLD_CLUSTER_DIR/pg_hba.conf.orig"
        fi
        # Prepend trust rule for local unix socket connections during upgrade
        sed -i '1s/^/local all all trust\n/' "$OLD_CLUSTER_DIR/pg_hba.conf"
    fi

    mkdir -p "$NEW_PGDATA"
    # If resuming an interrupted migration, wipe incomplete target files first
    rm -rf "${NEW_PGDATA:?}"/*
    chmod 700 "$NEW_PGDATA"
    chmod 700 "$OLD_CLUSTER_DIR"

    # Initialize PostgreSQL 18 cluster with matching superuser and checksums
    "$NEW_BIN/initdb" -D "$NEW_PGDATA" $INITDB_CHECKSUM_ARG -U "$MIGRATION_SUPERUSER"

    # Run pg_upgrade
    echo "Executing pg_upgrade..."
    cd /tmp
    set +e
    "$NEW_BIN/pg_upgrade" \
        -d "$OLD_CLUSTER_DIR" \
        -D "$NEW_PGDATA" \
        -b "$OLD_BIN" \
        -B "$NEW_BIN" \
        -U "$MIGRATION_SUPERUSER"
    UPGRADE_EXIT_CODE=$?
    set -e

    if [ $UPGRADE_EXIT_CODE -ne 0 ]; then
        echo "ERROR: pg_upgrade failed with exit code $UPGRADE_EXIT_CODE!" >&2
        echo "=== Dumping all pg_upgrade log files ===" >&2
        find "$NEW_PGDATA" -type f -name "*.log" -exec echo "--- {} ---" \; -exec cat {} \; >&2
        restore_old_cluster_configs
        exit $UPGRADE_EXIT_CODE
    fi

    echo "pg_upgrade completed successfully!"

    # Restore authentication configuration from old cluster into new PostgreSQL 18 cluster
    if [ -f "$OLD_CLUSTER_DIR/pg_hba.conf.orig" ]; then
        echo "Restoring authentication configuration (pg_hba.conf, pg_ident.conf) to new cluster..."
        cp -p "$OLD_CLUSTER_DIR/pg_hba.conf.orig" "$NEW_PGDATA/pg_hba.conf"
        [ -f "$OLD_CLUSTER_DIR/pg_ident.conf" ] && cp -p "$OLD_CLUSTER_DIR/pg_ident.conf" "$NEW_PGDATA/pg_ident.conf"
    elif [ -f "$OLD_CLUSTER_DIR/pg_hba.conf" ]; then
        echo "Restoring authentication configuration (pg_hba.conf, pg_ident.conf) to new cluster..."
        cp -p "$OLD_CLUSTER_DIR/pg_hba.conf" "$NEW_PGDATA/pg_hba.conf"
        [ -f "$OLD_CLUSTER_DIR/pg_ident.conf" ] && cp -p "$OLD_CLUSTER_DIR/pg_ident.conf" "$NEW_PGDATA/pg_ident.conf"
    fi

    # Restore the source cluster's original configs so the backup and any rollback remain pristine
    restore_old_cluster_configs
    trap - ERR

    # Preserve old data cluster as backup so NO DATA IS EVER DELETED
    BACKUP_PATH="/var/lib/postgresql/data.v${OLD_VERSION}.bak"
    if [ "$OLD_CLUSTER_DIR" != "$BACKUP_PATH" ]; then
        echo "Safely retaining old cluster at $BACKUP_PATH..."
        mv "$OLD_CLUSTER_DIR" "$BACKUP_PATH"
    fi
    touch "/var/lib/postgresql/.migrated_to_18"
    echo "Upgrade to PostgreSQL 18 complete. Proceeding to startup."
    echo "=========================================================="
fi

# Ensure application environment variables are exported for official docker-entrypoint
export POSTGRES_USER="${POSTGRES_USER:-${POSTGRESQL_USER:-postgres}}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-${POSTGRESQL_PASSWORD:-}}"
export POSTGRES_DB="${POSTGRES_DB:-${POSTGRESQL_DATABASE:-${POSTGRES_USER}}}"
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Hand off execution to official docker-entrypoint
exec docker-entrypoint.sh postgres "$@"
