#!/bin/bash
set -euo pipefail

# Database backup script for Toutopia
# Usage: ./scripts/backup-db.sh
# Requires: docker, gzip

CONTAINER="${DB_CONTAINER:-toutopia-db}"
DB_NAME="${DB_NAME:-toutopia}"
DB_USER="${DB_USER:-toutopia}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="toutopia_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting backup of database '${DB_NAME}'..."
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "Backup created: ${FILENAME} (${SIZE})"

# Remove old backups
DELETED=$(find "$BACKUP_DIR" -name "toutopia_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "Removed ${DELETED} backup(s) older than ${RETENTION_DAYS} days"
fi

echo "Backup complete."
