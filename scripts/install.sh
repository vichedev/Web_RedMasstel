#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
#  Red MaasTel — Instalador completo para servidores Debian/Ubuntu
# ────────────────────────────────────────────────────────────────────
#  Hace todo lo necesario para una instalación desde cero:
#    • Instala Node.js 20, PostgreSQL, nginx y PM2 si faltan.
#    • Crea la base de datos, el usuario y la extensión uuid-ossp.
#    • Extrae el tarball de despliegue, genera el .env y corre migraciones.
#    • Configura nginx como reverse proxy del backend.
#    • Arranca la app con PM2 y la deja en autostart.
#
#  Uso:
#    sudo bash install.sh
#    (necesita el archivo red-maastel-deploy.tar.gz; por defecto en /tmp/)
#
#  Es idempotente — puedes re-correrlo sin perder datos.
# ────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Estilo de salida ───────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗ $1${NC}" >&2; exit 1; }
hr()   { echo -e "${BLUE}────────────────────────────────────────────────────────${NC}"; }

clear
echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Red MaasTel — Instalador del sistema                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Pre-flight ─────────────────────────────────────────────────────
[ "$EUID" -eq 0 ] || fail "Debes ejecutar como root (sudo bash $0)"
command -v apt-get >/dev/null 2>&1 || fail "Solo soporta Debian/Ubuntu (apt-get no encontrado)"

# ─── Prompts ────────────────────────────────────────────────────────
TARBALL_DEFAULT="/tmp/red-maastel-deploy.tar.gz"
INSTALL_DIR_DEFAULT="/var/www/redmaastel"
DOMAIN_DEFAULT="telcomfib-preview.theworkpc.com"
DB_NAME_DEFAULT="redmaastel"
DB_USER_DEFAULT="redmaastel_user"
ADMIN_EMAIL_DEFAULT="admin@telcomfib.com"
ADMIN_NAME_DEFAULT="Administrador"
PORT_DEFAULT="3000"

echo "Configura los valores (Enter usa el valor entre [corchetes]):"
echo

read -r -p "Path al tarball red-maastel-deploy.tar.gz [${TARBALL_DEFAULT}]: " TARBALL
TARBALL="${TARBALL:-$TARBALL_DEFAULT}"
[ -f "$TARBALL" ] || fail "No encontré el tarball en $TARBALL"

read -r -p "Carpeta de instalación [${INSTALL_DIR_DEFAULT}]: " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$INSTALL_DIR_DEFAULT}"

read -r -p "Dominio público [${DOMAIN_DEFAULT}]: " DOMAIN
DOMAIN="${DOMAIN:-$DOMAIN_DEFAULT}"

read -r -p "Puerto local del backend [${PORT_DEFAULT}]: " APP_PORT
APP_PORT="${APP_PORT:-$PORT_DEFAULT}"

read -r -p "Nombre de la BD [${DB_NAME_DEFAULT}]: " DB_NAME
DB_NAME="${DB_NAME:-$DB_NAME_DEFAULT}"

read -r -p "Usuario de la BD [${DB_USER_DEFAULT}]: " DB_USER
DB_USER="${DB_USER:-$DB_USER_DEFAULT}"

read -r -s -p "Password de la BD (Enter para auto-generar): " DB_PASSWORD
echo
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/=+\n' | cut -c1-32)
  warn "Password de DB generado automáticamente. Se guardará en $INSTALL_DIR/.env"
fi

read -r -p "Email del super admin [${ADMIN_EMAIL_DEFAULT}]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-$ADMIN_EMAIL_DEFAULT}"

read -r -p "Nombre del super admin [${ADMIN_NAME_DEFAULT}]: " ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-$ADMIN_NAME_DEFAULT}"

while true; do
  read -r -s -p "Password del super admin (mínimo 8): " ADMIN_PASSWORD
  echo
  [ ${#ADMIN_PASSWORD} -ge 8 ] && break
  warn "Mínimo 8 caracteres"
done

# JWT secret se genera siempre — el schema exige ≥ 48 chars en prod
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

hr
echo -e "${BOLD}Resumen:${NC}"
echo "  Tarball       : $TARBALL"
echo "  Install dir   : $INSTALL_DIR"
echo "  Dominio       : $DOMAIN"
echo "  Puerto        : $APP_PORT"
echo "  Base de datos : $DB_NAME (usuario: $DB_USER)"
echo "  Super admin   : $ADMIN_EMAIL"
hr
read -r -p "¿Continuar con la instalación? [s/N]: " CONFIRM
[ "$CONFIRM" = "s" ] || [ "$CONFIRM" = "S" ] || fail "Cancelado por el usuario"

# ─── 1. Paquetes del sistema ────────────────────────────────────────
hr
log "[1/8] Instalando dependencias del sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -qq -y curl ca-certificates gnupg openssl >/dev/null

# Node.js 20
NODE_OK="false"
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
  [ "$NODE_MAJOR" -ge 20 ] && NODE_OK="true"
fi
if [ "$NODE_OK" = "false" ]; then
  log "Instalando Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -qq -y nodejs >/dev/null
fi
ok "Node.js $(node -v)"

# PostgreSQL
if ! command -v psql >/dev/null 2>&1; then
  log "Instalando PostgreSQL..."
  apt-get install -qq -y postgresql postgresql-contrib >/dev/null
fi
ok "PostgreSQL $(psql --version | awk '{print $3}')"

# nginx
if ! command -v nginx >/dev/null 2>&1; then
  log "Instalando nginx..."
  apt-get install -qq -y nginx >/dev/null
fi
ok "nginx $(nginx -v 2>&1 | awk -F/ '{print $2}')"

# PM2
if ! command -v pm2 >/dev/null 2>&1; then
  log "Instalando PM2..."
  npm install -g pm2 >/dev/null 2>&1
fi
ok "PM2 $(pm2 --version)"

# ─── 2. Configurar PostgreSQL ───────────────────────────────────────
hr
log "[2/8] Configurando PostgreSQL..."
systemctl enable --now postgresql >/dev/null 2>&1 || true

USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")
if [ "$USER_EXISTS" = "1" ]; then
  warn "El usuario $DB_USER ya existe — actualizo el password"
  sudo -u postgres psql -c "ALTER USER \"$DB_USER\" WITH PASSWORD '$DB_PASSWORD';" >/dev/null
else
  sudo -u postgres psql -c "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASSWORD';" >/dev/null
  ok "Usuario $DB_USER creado"
fi

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
if [ "$DB_EXISTS" = "1" ]; then
  warn "La base de datos $DB_NAME ya existe — se preserva"
else
  sudo -u postgres psql -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" >/dev/null
  ok "Base de datos $DB_NAME creada"
fi

sudo -u postgres psql -d "$DB_NAME" >/dev/null <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
GRANT ALL ON SCHEMA public TO "$DB_USER";
ALTER SCHEMA public OWNER TO "$DB_USER";
EOF
ok "Extensión uuid-ossp y permisos configurados"

# ─── 3. Extraer la app ──────────────────────────────────────────────
hr
log "[3/8] Extrayendo aplicación en $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
tar -xzf "$TARBALL" -C "$INSTALL_DIR"
ok "Archivos extraídos"

# ─── 4. Generar .env ────────────────────────────────────────────────
hr
log "[4/8] Generando archivo .env..."
ENV_FILE="$INSTALL_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%Y%m%d-%H%M%S)"
  warn "Existing .env respaldado"
fi

cat > "$ENV_FILE" <<EOF
# Generado por install.sh el $(date)
NODE_ENV=production
PORT=$APP_PORT
API_PREFIX=api/v1

# ─── Base de datos ─────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=$DB_NAME
DB_SYNCHRONIZE=false
DB_LOGGING=false

# ─── JWT ───────────────────────────────────────────────────────
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=1d

# ─── Cookie de sesión ──────────────────────────────────────────
COOKIE_NAME=ws_session
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=

# ─── CORS ──────────────────────────────────────────────────────
CORS_ORIGIN=http://$DOMAIN

# ─── Hashing y throttling ──────────────────────────────────────
BCRYPT_SALT_ROUNDS=12
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=120

# ─── Seed inicial ──────────────────────────────────────────────
SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD
SEED_ADMIN_NAME=$ADMIN_NAME

# ─── Uploads ───────────────────────────────────────────────────
UPLOAD_DEST=./uploads
UPLOAD_MAX_SIZE=26214400
EOF
chmod 600 "$ENV_FILE"
ok ".env generado (permisos 600)"

mkdir -p "$INSTALL_DIR/uploads"
chmod 750 "$INSTALL_DIR/uploads"
ok "Carpeta uploads/ creada"

# ─── 5. Instalar dependencias y migrar ──────────────────────────────
hr
log "[5/8] Instalando dependencias de Node (puede tardar 1-3 minutos)..."
cd "$INSTALL_DIR"
npm ci --omit=dev --no-audit --no-fund --silent
ok "Dependencias de producción instaladas"

log "Ejecutando migraciones de la base de datos..."
npm run migration:run:prod
ok "Migraciones aplicadas"

# ─── 6. Configurar nginx ────────────────────────────────────────────
hr
log "[6/8] Configurando nginx..."
NGINX_CONF="/etc/nginx/sites-available/redmaastel"
cat > "$NGINX_CONF" <<EOF
# Generado por install.sh el $(date)
server {
    listen 80;
    server_name $DOMAIN;

    # Hasta 30 MB para subir PDFs (límite del backend = 25 MB).
    client_max_body_size 30M;

    access_log /var/log/nginx/redmaastel.access.log;
    error_log  /var/log/nginx/redmaastel.error.log;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90;
    }
}
EOF
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/redmaastel
rm -f /etc/nginx/sites-enabled/default
nginx -t >/dev/null 2>&1 || fail "nginx -t falló — revisa $NGINX_CONF"
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx
ok "nginx configurado y recargado"

# ─── 7. Arrancar con PM2 ────────────────────────────────────────────
hr
log "[7/8] Arrancando la app con PM2..."
cd "$INSTALL_DIR"

if pm2 describe red-maastel-api >/dev/null 2>&1; then
  pm2 reload red-maastel-api --update-env >/dev/null
  ok "App recargada en PM2"
else
  pm2 start dist/main.js --name red-maastel-api --time >/dev/null
  ok "App iniciada en PM2"
fi
pm2 save >/dev/null

# Configurar autostart al boot. `pm2 startup` imprime un comando que
# luego ejecutamos para registrar el servicio systemd.
PM2_CMD=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo env" | head -1 || true)
if [ -n "$PM2_CMD" ]; then
  eval "$PM2_CMD" >/dev/null 2>&1 || warn "No pude registrar PM2 en systemd automáticamente (corre 'pm2 startup' manualmente si quieres autostart)"
fi
ok "PM2 listo"

# ─── 8. Firewall y verificación ─────────────────────────────────────
hr
log "[8/8] Verificando..."

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 22/tcp >/dev/null 2>&1 || true
  ok "UFW: puertos 80 y 22 permitidos"
fi

# Esperar a que el backend esté listo
for i in {1..15}; do
  if curl -fsS "http://127.0.0.1:$APP_PORT/api/v1/branches" >/dev/null 2>&1; then
    ok "Backend responde en /api/v1/branches"
    BACKEND_OK="true"
    break
  fi
  sleep 1
done

if [ "${BACKEND_OK:-}" != "true" ]; then
  warn "El backend no respondió en 15s. Revisa: pm2 logs red-maastel-api"
fi

if curl -fsS -H "Host: $DOMAIN" "http://127.0.0.1/" >/dev/null 2>&1; then
  ok "nginx responde (proxy → backend)"
fi

# ─── Resumen final ──────────────────────────────────────────────────
hr
echo
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✓ Instalación completa                             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo
echo -e "  ${BOLD}URL del sitio:${NC}    http://$DOMAIN"
echo -e "  ${BOLD}Login admin:${NC}      http://$DOMAIN/login"
echo -e "  ${BOLD}Email admin:${NC}      $ADMIN_EMAIL"
echo -e "  ${BOLD}Password admin:${NC}   (la que ingresaste — ${RED}CÁMBIALA AHORA${NC})"
echo
echo -e "${BOLD}Comandos útiles:${NC}"
echo "  pm2 status                                  # estado de la app"
echo "  pm2 logs red-maastel-api                        # logs en vivo"
echo "  pm2 restart red-maastel-api                     # reiniciar"
echo "  systemctl status nginx                      # estado de nginx"
echo "  tail -f /var/log/nginx/redmaastel.error.log    # errores de nginx"
echo "  cat $INSTALL_DIR/.env                       # ver config"
echo
echo -e "${YELLOW}${BOLD}Próximos pasos:${NC}"
echo "  1. Entra al panel y cambia la password del admin desde Perfil."
echo "  2. Configura sucursales, redes sociales, EmailJS, logos…"
echo "  3. Cuando estés listo para HTTPS:"
echo "       apt-get install -y certbot python3-certbot-nginx"
echo "       certbot --nginx -d $DOMAIN"
echo "       (luego cambia COOKIE_SECURE=true en $INSTALL_DIR/.env)"
echo
