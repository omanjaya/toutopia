#!/bin/bash
set -euo pipefail

# Initial SSL certificate setup for Toutopia
# Usage: ./scripts/init-ssl.sh [email]
# Must be run BEFORE starting nginx with SSL

EMAIL="${1:-admin@toutopia.id}"
DOMAINS=("toutopia.nouma.id" "storage-toutopia.nouma.id")

echo "=== Toutopia SSL Setup ==="
echo "Email: $EMAIL"
echo "Domains: ${DOMAINS[*]}"
echo ""

# Create required directories
mkdir -p nginx/ssl-init

# Step 1: Create temporary nginx config for certificate challenge
cat > nginx/ssl-init/temp.conf << 'TEMP_CONF'
server {
    listen 80;
    server_name toutopia.nouma.id storage-toutopia.nouma.id;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL setup in progress';
        add_header Content-Type text/plain;
    }
}
TEMP_CONF

echo "1/4 Starting temporary nginx for ACME challenge..."
docker compose -f docker-compose.prod.yml run -d --rm \
  --name toutopia-nginx-temp \
  -p 80:80 \
  -v "$(pwd)/nginx/ssl-init/temp.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "toutopia_certbot-www:/var/www/certbot" \
  nginx nginx-debug -g 'daemon off;'

sleep 3

echo "2/4 Requesting certificates..."
for domain in "${DOMAINS[@]}"; do
  echo "  Requesting certificate for $domain..."
  docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$domain"
done

echo "3/4 Stopping temporary nginx..."
docker stop toutopia-nginx-temp 2>/dev/null || true

echo "4/4 Cleaning up..."
rm -rf nginx/ssl-init

echo ""
echo "=== SSL certificates obtained successfully! ==="
echo "You can now start the full stack:"
echo "  docker compose -f docker-compose.prod.yml up -d"
