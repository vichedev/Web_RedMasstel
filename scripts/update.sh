#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
#  Red MaasTel — Actualización de versión (preserva .env, BD y uploads)
# ────────────────────────────────────────────────────────────────────
#  Para re-deploys de código sin tocar la BD ni la configuración.
#  Solo reemplaza: dist/, public/ y los package*.json. Si cambia el
#  package-lock, reinstala dependencias. Corre migraciones nuevas.
#
#  Uso:
#    sudo bash update.sh [tarball] [install_dir]
#
#  Por defecto:
#    tarball     = /tmp/red-maastel-deploy.tar.gz
#    install_dir = /var/www/redmaastel
# ────────────────────────────────────────────────────────────────────

set -euo pipefail

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

TARBALL="${1:-/tmp/red-maastel-deploy.tar.gz}"
INSTALL_DIR="${2:-/var/www/redmaastel}"

[ "$EUID" -eq 0 ] || fail "Debes ejecutar como root (sudo bash $0)"
[ -f "$TARBALL" ] || fail "No encontré el tarball: $TARBALL"
[ -d "$INSTALL_DIR" ] || fail "Carpeta de instalación no existe: $INSTALL_DIR — usa install.sh para primera instalación"
[ -f "$INSTALL_DIR/.env" ] || fail "Falta .env en $INSTALL_DIR — usa install.sh"

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Red MaasTel — Actualización                           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "  Tarball     : $TARBALL"
echo "  Install dir : $INSTALL_DIR"
echo

# ─── Backup ─────────────────────────────────────────────────────────
hr
log "Backup de la versión actual..."
TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$INSTALL_DIR/.backups/$TS"
mkdir -p "$BACKUP_DIR"
[ -d "$INSTALL_DIR/dist" ] && cp -r "$INSTALL_DIR/dist" "$BACKUP_DIR/dist"
[ -d "$INSTALL_DIR/public" ] && cp -r "$INSTALL_DIR/public" "$BACKUP_DIR/public"
[ -f "$INSTALL_DIR/package.json" ] && cp "$INSTALL_DIR/package.json" "$BACKUP_DIR/package.json"
[ -f "$INSTALL_DIR/package-lock.json" ] && cp "$INSTALL_DIR/package-lock.json" "$BACKUP_DIR/package-lock.json"
ok "Backup en $BACKUP_DIR"

# Mantener solo los últimos 5 backups
find "$INSTALL_DIR/.backups" -mindepth 1 -maxdepth 1 -type d | sort | head -n -5 | xargs -r rm -rf
ok "Backups antiguos limpiados (se mantienen los 5 más recientes)"

# ─── Reemplazar archivos ────────────────────────────────────────────
hr
log "Extrayendo nueva versión..."

# Si el package-lock va a cambiar, lo detectamos antes para decidir
# si reinstalar deps. Comparamos hashes.
OLD_LOCK_HASH=""
[ -f "$INSTALL_DIR/package-lock.json" ] && OLD_LOCK_HASH=$(sha256sum "$INSTALL_DIR/package-lock.json" | awk '{print $1}')

# Borramos dist/ y public/ antes de extraer para que archivos viejos
# (por ejemplo bundles renombrados con hash) no queden colgados.
rm -rf "$INSTALL_DIR/dist" "$INSTALL_DIR/public"

# Extraemos solo lo que cambia entre versiones. uploads/ y .env quedan
# intactos. scripts/ se actualiza para tener la última versión disponible.
tar -xzf "$TARBALL" -C "$INSTALL_DIR" \
  dist public package.json package-lock.json scripts
ok "Archivos actualizados"

NEW_LOCK_HASH=""
[ -f "$INSTALL_DIR/package-lock.json" ] && NEW_LOCK_HASH=$(sha256sum "$INSTALL_DIR/package-lock.json" | awk '{print $1}')

cd "$INSTALL_DIR"

# ─── Dependencias ───────────────────────────────────────────────────
hr
if [ "$OLD_LOCK_HASH" != "$NEW_LOCK_HASH" ] || [ ! -d "node_modules" ]; then
  log "package-lock cambió o falta node_modules — reinstalando..."
  npm ci --omit=dev --no-audit --no-fund --silent
  ok "Dependencias actualizadas"
else
  ok "package-lock sin cambios — saltando npm install"
fi

# ─── Migraciones ────────────────────────────────────────────────────
hr
log "Ejecutando migraciones (si hay nuevas)..."
npm run migration:run:prod
ok "Migraciones aplicadas"

# ─── Reinicio ───────────────────────────────────────────────────────
hr
log "Recargando PM2..."
if pm2 describe red-maastel-api >/dev/null 2>&1; then
  pm2 reload red-maastel-api --update-env >/dev/null
else
  pm2 start dist/main.js --name red-maastel-api --time >/dev/null
fi
pm2 save >/dev/null
ok "App recargada"

# ─── Verificación ───────────────────────────────────────────────────
hr
APP_PORT=$(grep "^PORT=" .env | cut -d= -f2 | tr -d '"' | tr -d "'")
APP_PORT="${APP_PORT:-3000}"

for i in {1..15}; do
  if curl -fsS "http://127.0.0.1:$APP_PORT/api/v1/branches" >/dev/null 2>&1; then
    ok "Backend responde correctamente"
    BACKEND_OK="true"
    break
  fi
  sleep 1
done

if [ "${BACKEND_OK:-}" != "true" ]; then
  warn "El backend no respondió en 15s. Revisa: pm2 logs red-maastel-api --lines 100"
  warn "Si necesitas rollback rápido:"
  warn "  cp -r $BACKUP_DIR/dist $INSTALL_DIR/dist"
  warn "  cp -r $BACKUP_DIR/public $INSTALL_DIR/public"
  warn "  pm2 reload red-maastel-api"
  exit 1
fi

hr
echo -e "${GREEN}${BOLD}✓ Update completo${NC}"
echo
echo "  Versión anterior: $BACKUP_DIR"
echo "  Logs:             pm2 logs red-maastel-api"
echo
