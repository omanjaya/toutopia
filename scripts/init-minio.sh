#!/bin/bash
set -euo pipefail

# Initialize MinIO bucket and policy for Toutopia
# Usage: ./scripts/init-minio.sh
# Run after docker compose up

CONTAINER="${MINIO_CONTAINER:-toutopia-minio}"
BUCKET="${MINIO_BUCKET:-uploads}"

echo "=== MinIO Setup ==="

echo "1/3 Configuring MinIO client..."
docker exec "$CONTAINER" mc alias set local http://localhost:9000 \
  "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"

echo "2/3 Creating bucket '$BUCKET'..."
docker exec "$CONTAINER" mc mb "local/$BUCKET" --ignore-existing

echo "3/3 Setting public read policy on '$BUCKET'..."
docker exec "$CONTAINER" mc anonymous set download "local/$BUCKET"

echo ""
echo "=== MinIO setup complete! ==="
echo "Bucket: $BUCKET"
echo "Public URL: https://storage-toutopia.nouma.id/$BUCKET/"
