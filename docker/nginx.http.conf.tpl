# ─── Reverse proxy HTTP ────────────────────────────────────────────
# Plantilla. Generada por scripts/deploy.sh — variable: __DOMAIN__
# ───────────────────────────────────────────────────────────────────

server {
    listen 80 default_server;
    server_name __DOMAIN__;

    # ACME (Let's Encrypt) — sirve los challenges de http-01.
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
    }

    # Subidas hasta 30 MB (límite del backend = 25 MB).
    client_max_body_size 30M;

    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log;

    location / {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;

        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 90;
        proxy_send_timeout 90;
    }
}
