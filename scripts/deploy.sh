#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
#  Red MaasTel — Despliegue Docker interactivo
# ──────────────────────────────────────────────────────────────────────
#  Lo que hace este script:
#    1. Verifica/instala Docker + Docker Compose v2.
#    2. Pregunta dominio, BD, super admin y opcional HTTPS (Let's Encrypt).
#    3. Genera .env.deploy con secrets fuertes (JWT/DB autogen).
#    4. Renderiza el nginx.conf desde la plantilla HTTP.
#    5. Construye la imagen multi-stage (front + back).
#    6. Levanta el stack: postgres + backend + nginx.
#    7. Si pediste HTTPS: certbot via webroot → re-render a HTTPS → reload.
#    8. Verifica que la app responde y muestra el resumen.
#
#  Uso:
#    sudo bash scripts/deploy.sh                 # despliegue interactivo
#    sudo bash scripts/deploy.sh --update        # rebuild sin perder .env
#    sudo bash scripts/deploy.sh --stop          # detiene el stack
#    sudo bash scripts/deploy.sh --logs          # tail de logs
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Estilo ─────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
BLUE='\033[0;34m';  CYAN='\033[0;36m';  BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

log()  { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗ $1${NC}" >&2; exit 1; }
hr()   { echo -e "${DIM}────────────────────────────────────────────────────────${NC}"; }

banner() {
  clear
  echo -e "${CYAN}${BOLD}"
  cat <<'BANNER'
  ╔══════════════════════════════════════════════════════════════════╗
  ║                                                                  ║
  ║         ░█▀▀░█▀█░█▀▀░█▀█░█▀█░█▀▀░▀█▀                             ║
  ║         ░█░░░█▀█░█▀▀░█▀█░█░█░█▀▀░░█░                             ║
  ║         ░▀▀▀░▀░▀░▀░░░▀░▀░▀░▀░▀▀▀░░▀░                             ║
  ║                                                                  ║
  ║         Despliegue Docker  ·  Web Dinámica Admin                 ║
  ║                                                                  ║
  ╚══════════════════════════════════════════════════════════════════╝
BANNER
  echo -e "${NC}"
}

# ─── Paths ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLIC_DIR="$BACK_DIR/public"

COMPOSE_FILE="$BACK_DIR/docker-compose.prod.yml"
ENV_FILE="$BACK_DIR/.env.deploy"
NGINX_HTTP_TPL="$BACK_DIR/docker/nginx.http.conf.tpl"
NGINX_HTTPS_TPL="$BACK_DIR/docker/nginx.https.conf.tpl"
NGINX_OUT="$BACK_DIR/docker/nginx.conf"

dc() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

# ─── Subcomandos rápidos (no interactivo) ───────────────────────────
case "${1:-}" in
  --stop)
    [ -f "$ENV_FILE" ] || fail "No hay .env.deploy — ¿desplegaste alguna vez?"
    log "Deteniendo stack..."
    dc down
    ok "Stack detenido"
    exit 0
    ;;
  --logs)
    [ -f "$ENV_FILE" ] || fail "No hay .env.deploy"
    dc logs -f --tail=200
    exit 0
    ;;
  --status)
    [ -f "$ENV_FILE" ] || fail "No hay .env.deploy"
    dc ps
    exit 0
    ;;
  --update)
    [ -f "$ENV_FILE" ] || fail "No hay .env.deploy — corre el deploy completo primero"
    banner
    log "Modo actualización: rebuild + recreate (preserva BD, uploads, .env)"
    hr
    log "Reconstruyendo imagen del backend..."
    dc build backend
    ok "Imagen reconstruida"
    log "Recreando contenedores..."
    dc up -d
    ok "Stack actualizado"
    dc ps
    exit 0
    ;;
  --help|-h)
    echo "Uso: sudo bash $0 [--update|--stop|--logs|--status]"
    exit 0
    ;;
esac

# ─── Pre-flight ─────────────────────────────────────────────────────
banner

[ "$EUID" -eq 0 ] || fail "Ejecútame como root: sudo bash $0"
[ -f "$COMPOSE_FILE" ] || fail "Falta docker-compose.prod.yml"
[ -f "$NGINX_HTTP_TPL" ] || fail "Falta plantilla nginx HTTP"
[ -f "$NGINX_HTTPS_TPL" ] || fail "Falta plantilla nginx HTTPS"

# El front se compila en local y su dist/ debe estar en back/public/
if [ ! -d "$PUBLIC_DIR" ] || [ -z "$(ls -A "$PUBLIC_DIR" 2>/dev/null)" ]; then
  fail "No encuentro el build del frontend en $PUBLIC_DIR — compila el front (npm run build) y copia el dist/ a back/public/ antes de desplegar."
fi
[ -f "$PUBLIC_DIR/index.html" ] || warn "$PUBLIC_DIR existe pero no tiene index.html — ¿seguro que copiaste el build correcto?"

OS_ID=""
if [ -f /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_ID="$ID"
fi

# ─── Instalar Docker si falta ───────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "Docker no detectado — instalando con get.docker.com..."
  curl -fsSL https://get.docker.com | sh >/dev/null
  ok "Docker instalado"
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose v2 no disponible. Actualiza Docker (>= 20.10.13)."
fi

systemctl enable --now docker >/dev/null 2>&1 || true
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',') · Compose $(docker compose version --short 2>/dev/null || echo 'v2')"

# Herramientas auxiliares
for tool in openssl curl; do
  command -v "$tool" >/dev/null 2>&1 || {
    if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
      apt-get update -qq && apt-get install -qq -y "$tool" >/dev/null
    else
      fail "Falta '$tool' — instálalo manualmente"
    fi
  }
done

# ─── Cargar valores previos si existen (re-deploy) ──────────────────
PREV_DOMAIN=""; PREV_DB_USER=""; PREV_DB_NAME=""; PREV_DB_PASSWORD=""
PREV_ADMIN_EMAIL=""; PREV_ADMIN_NAME=""
RE_DEPLOY="false"
if [ -f "$ENV_FILE" ]; then
  RE_DEPLOY="true"
  warn "Ya existe $ENV_FILE — los valores actuales se ofrecerán como predeterminados"
  PREV_DOMAIN=$(grep -E '^DOMAIN=' "$ENV_FILE" | cut -d= -f2- || true)
  PREV_DB_USER=$(grep -E '^DB_USERNAME=' "$ENV_FILE" | cut -d= -f2- || true)
  PREV_DB_NAME=$(grep -E '^DB_DATABASE=' "$ENV_FILE" | cut -d= -f2- || true)
  PREV_DB_PASSWORD=$(grep -E '^DB_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)
  PREV_ADMIN_EMAIL=$(grep -E '^SEED_ADMIN_EMAIL=' "$ENV_FILE" | cut -d= -f2- || true)
  PREV_ADMIN_NAME=$(grep -E '^SEED_ADMIN_NAME=' "$ENV_FILE" | cut -d= -f2- || true)
fi

# ─── Prompts ────────────────────────────────────────────────────────
hr
echo -e "${BOLD}Configuración del despliegue${NC}  ${DIM}(Enter usa el valor en [corchetes])${NC}"
echo

DOMAIN_DEFAULT="${PREV_DOMAIN:-networkmap.casacam.net}"
read -r -p "Dominio público [$DOMAIN_DEFAULT]: " DOMAIN
DOMAIN="${DOMAIN:-$DOMAIN_DEFAULT}"
[[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ ]] || fail "Dominio inválido: $DOMAIN"

read -r -p "Puerto HTTP a exponer [80]: " HTTP_PORT
HTTP_PORT="${HTTP_PORT:-80}"

read -r -p "Puerto HTTPS a exponer [443]: " HTTPS_PORT
HTTPS_PORT="${HTTPS_PORT:-443}"

read -r -p "¿Configurar HTTPS con Let's Encrypt ahora? [s/N]: " HTTPS_YN
ENABLE_HTTPS="false"; LE_EMAIL=""
if [[ "$HTTPS_YN" =~ ^[sSyY]$ ]]; then
  ENABLE_HTTPS="true"
  read -r -p "Email para notificaciones de Let's Encrypt: " LE_EMAIL
  [[ "$LE_EMAIL" =~ ^[^@]+@[^@]+\.[^@]+$ ]] || fail "Email inválido"
  warn "El dominio $DOMAIN debe apuntar ya a la IP de este servidor — si no, certbot fallará."
fi

DB_USER_DEFAULT="${PREV_DB_USER:-redmaastel}"
DB_NAME_DEFAULT="${PREV_DB_NAME:-redmaastelweb}"
read -r -p "Usuario de PostgreSQL [$DB_USER_DEFAULT]: " DB_USER
DB_USER="${DB_USER:-$DB_USER_DEFAULT}"
read -r -p "Nombre de la base de datos [$DB_NAME_DEFAULT]: " DB_NAME
DB_NAME="${DB_NAME:-$DB_NAME_DEFAULT}"

if [ -n "$PREV_DB_PASSWORD" ]; then
  read -r -s -p "Password de la BD (Enter = mantener la actual): " DB_PASSWORD; echo
  DB_PASSWORD="${DB_PASSWORD:-$PREV_DB_PASSWORD}"
  if [ "$DB_PASSWORD" != "$PREV_DB_PASSWORD" ]; then
    warn "Cambiar la password rompe la conexión al postgres existente."
    warn "Tendrás que ejecutar 'docker compose -f docker-compose.prod.yml --env-file .env.deploy down -v' para resetear la BD."
  fi
else
  read -r -s -p "Password de la BD (Enter = autogenerada): " DB_PASSWORD; echo
  if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/=+\n' | cut -c1-32)
    warn "Password de BD generada automáticamente (se guarda en $ENV_FILE)"
  fi
fi

ADMIN_EMAIL_DEFAULT="${PREV_ADMIN_EMAIL:-admin@webdinamica.com}"
ADMIN_NAME_DEFAULT="${PREV_ADMIN_NAME:-Super Admin}"
read -r -p "Email del super admin [$ADMIN_EMAIL_DEFAULT]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-$ADMIN_EMAIL_DEFAULT}"
read -r -p "Nombre del super admin [$ADMIN_NAME_DEFAULT]: " ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-$ADMIN_NAME_DEFAULT}"

PREV_ADMIN_PASSWORD=""
[ "$RE_DEPLOY" = "true" ] && PREV_ADMIN_PASSWORD=$(grep -E '^SEED_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)

while true; do
  if [ -n "$PREV_ADMIN_PASSWORD" ]; then
    read -r -s -p "Password del super admin (Enter = mantener la actual; si ya cambiaste desde la web, ignórala): " ADMIN_PASSWORD; echo
    [ -z "$ADMIN_PASSWORD" ] && ADMIN_PASSWORD="$PREV_ADMIN_PASSWORD" && break
  else
    read -r -s -p "Password del super admin (mínimo 8 caracteres): " ADMIN_PASSWORD; echo
  fi
  [ ${#ADMIN_PASSWORD} -ge 8 ] && break
  warn "Mínimo 8 caracteres"
done

# JWT siempre nuevo (≥ 48 chars como exige el schema en producción)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Cookies/CORS según protocolo
if [ "$ENABLE_HTTPS" = "true" ]; then
  PUBLIC_URL="https://$DOMAIN"; COOKIE_SECURE="true"
else
  PUBLIC_URL="http://$DOMAIN";  COOKIE_SECURE="false"
fi

# ─── Resumen y confirmación ─────────────────────────────────────────
hr
echo -e "${BOLD}Resumen del despliegue:${NC}"
printf "  %-18s %s\n" "Dominio"      "$DOMAIN"
printf "  %-18s %s\n" "URL pública"  "$PUBLIC_URL"
printf "  %-18s %s\n" "Puerto HTTP"  "$HTTP_PORT"
printf "  %-18s %s\n" "Puerto HTTPS" "$HTTPS_PORT"
printf "  %-18s %s\n" "HTTPS"        "$ENABLE_HTTPS"
printf "  %-18s %s\n" "Base de datos" "$DB_NAME (user: $DB_USER)"
printf "  %-18s %s\n" "Super admin"  "$ADMIN_EMAIL"
printf "  %-18s %s\n" "Carpeta back" "$BACK_DIR"
printf "  %-18s %s\n" "Build front"  "$PUBLIC_DIR"
hr
read -r -p "¿Continuar con el despliegue? [s/N]: " CONFIRM
[[ "$CONFIRM" =~ ^[sSyY]$ ]] || fail "Cancelado por el usuario"

# ─── Generar .env.deploy ────────────────────────────────────────────
hr
log "Generando $ENV_FILE..."
[ -f "$ENV_FILE" ] && cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%Y%m%d-%H%M%S)"

cat > "$ENV_FILE" <<EOF
# Generado por scripts/deploy.sh el $(date)
# NO COMMITEAR — contiene secretos.

DOMAIN=$DOMAIN
HTTP_PORT=$HTTP_PORT
HTTPS_PORT=$HTTPS_PORT

# ─── PostgreSQL ────────────────────────────────────────────────
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=$DB_NAME

# ─── JWT ───────────────────────────────────────────────────────
JWT_SECRET=$JWT_SECRET

# ─── Cookies / CORS ────────────────────────────────────────────
COOKIE_SECURE=$COOKIE_SECURE
COOKIE_DOMAIN=$DOMAIN
CORS_ORIGIN=$PUBLIC_URL

# ─── Seed inicial (super admin) ────────────────────────────────
SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD
SEED_ADMIN_NAME=$ADMIN_NAME
EOF
chmod 600 "$ENV_FILE"
ok "$ENV_FILE escrito (permisos 600)"

# ─── Renderizar nginx.conf (HTTP primero, siempre) ──────────────────
log "Renderizando nginx.conf (HTTP) para el bootstrap..."
sed "s/__DOMAIN__/$DOMAIN/g" "$NGINX_HTTP_TPL" > "$NGINX_OUT"
ok "docker/nginx.conf escrito"

# ─── Build de la imagen ─────────────────────────────────────────────
hr
log "Construyendo imagen del backend (front + back). Esto tarda 2-5 min la primera vez..."
DOCKER_BUILDKIT=1 dc build backend
ok "Imagen construida: red-maastel-api:latest"

# ─── Levantar el stack ──────────────────────────────────────────────
hr
log "Levantando contenedores..."
dc up -d
ok "Servicios arriba"
sleep 2
dc ps

# ─── Esperar a que el backend responda ──────────────────────────────
hr
log "Esperando a que el backend esté listo (hasta 120s)..."
BACKEND_OK="false"
for i in $(seq 1 60); do
  if curl -fsS -m 2 -H "Host: $DOMAIN" "http://127.0.0.1:$HTTP_PORT/api/v1/branches" >/dev/null 2>&1; then
    BACKEND_OK="true"; break
  fi
  sleep 2
  printf "."
done
echo
if [ "$BACKEND_OK" = "true" ]; then
  ok "Backend responde correctamente vía nginx"
else
  warn "El backend no respondió en 2 min. Revisa los logs:"
  warn "  docker compose -f docker-compose.prod.yml --env-file .env.deploy logs backend"
fi

# ─── HTTPS opcional (Let's Encrypt) ─────────────────────────────────
if [ "$ENABLE_HTTPS" = "true" ] && [ "$BACKEND_OK" = "true" ]; then
  hr
  log "Solicitando certificado Let's Encrypt para $DOMAIN..."

  # Webroot challenge — nginx ya está sirviendo /.well-known/acme-challenge/
  docker run --rm \
    -v "redmaastel_certbot_certs:/etc/letsencrypt" \
    -v "redmaastel_certbot_www:/var/www/certbot" \
    certbot/certbot:latest \
    certonly --webroot \
      -w /var/www/certbot \
      --non-interactive --agree-tos \
      --email "$LE_EMAIL" \
      -d "$DOMAIN" \
    && CERT_OK="true" || CERT_OK="false"

  if [ "$CERT_OK" = "true" ]; then
    ok "Certificado emitido"

    log "Cambiando nginx a configuración HTTPS..."
    sed "s/__DOMAIN__/$DOMAIN/g" "$NGINX_HTTPS_TPL" > "$NGINX_OUT"

    # Reload sin downtime — el bind mount ya apunta al archivo nuevo
    dc exec nginx nginx -t >/dev/null
    dc exec nginx nginx -s reload >/dev/null
    ok "nginx recargado con HTTPS"

    # Actualizar CORS_ORIGIN y COOKIE_SECURE en .env.deploy y recrear backend
    sed -i \
      -e "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://$DOMAIN|" \
      -e "s|^COOKIE_SECURE=.*|COOKIE_SECURE=true|" \
      "$ENV_FILE"
    log "Recreando backend con CORS/Cookies en HTTPS..."
    dc up -d --no-deps backend
    ok "Backend reiniciado en modo HTTPS"

    # Cron de renovación (twice a day, recomendado por Let's Encrypt)
    CRON_FILE="/etc/cron.d/red-maastel-certbot-renew"
    cat > "$CRON_FILE" <<CRON
# Renovación automática del cert de $DOMAIN — generado por deploy.sh
0 3,15 * * * root docker run --rm -v redmaastel_certbot_certs:/etc/letsencrypt -v redmaastel_certbot_www:/var/www/certbot certbot/certbot:latest renew --quiet && docker exec redmaastel_nginx nginx -s reload
CRON
    chmod 644 "$CRON_FILE"
    ok "Cron de renovación instalado en $CRON_FILE"
  else
    warn "Certbot falló. Revisa que $DOMAIN apunte a esta IP y vuelve a correr el deploy con HTTPS."
    warn "Mientras tanto, el sitio sigue disponible en http://$DOMAIN"
  fi
fi

# ─── Resumen final ──────────────────────────────────────────────────
hr
echo
echo -e "${GREEN}${BOLD}"
cat <<'BANNER'
  ╔══════════════════════════════════════════════════════════════════╗
  ║   ✓ Despliegue completado                                        ║
  ╚══════════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

FINAL_URL="$PUBLIC_URL"
[ "$ENABLE_HTTPS" = "true" ] && [ "${CERT_OK:-false}" = "true" ] && FINAL_URL="https://$DOMAIN"

echo -e "  ${BOLD}URL del sitio:${NC}    $FINAL_URL"
echo -e "  ${BOLD}Login admin:${NC}      $FINAL_URL/login"
echo -e "  ${BOLD}Email admin:${NC}      $ADMIN_EMAIL"
echo -e "  ${BOLD}Password admin:${NC}   ${RED}(la que ingresaste — cámbiala desde Perfil)${NC}"
echo
echo -e "${BOLD}Comandos útiles:${NC}"
echo "  sudo bash scripts/deploy.sh --status     # estado del stack"
echo "  sudo bash scripts/deploy.sh --logs       # logs en vivo"
echo "  sudo bash scripts/deploy.sh --update     # rebuild de la imagen"
echo "  sudo bash scripts/deploy.sh --stop       # detener el stack"
echo
echo -e "${BOLD}Archivos generados:${NC}"
echo "  $ENV_FILE         (secretos — backup automático antes de sobreescribir)"
echo "  $NGINX_OUT  (config nginx renderizada)"
echo
[ "$ENABLE_HTTPS" != "true" ] && cat <<TIP
${YELLOW}${BOLD}HTTPS más tarde:${NC}
  Vuelve a correr el deploy y responde "s" a la pregunta de HTTPS.
  Antes confirma que $DOMAIN ya apunta a la IP pública de este servidor.

TIP

echo -e "${DIM}─── ¡Listo! ────────────────────────────────────────────${NC}"
