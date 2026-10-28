#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  Red MaasTel — Instalador y gestor (Docker)
# ══════════════════════════════════════════════════════════════════════
#  Uso (en el servidor, dentro de la carpeta del repo):
#     sudo bash redmaastel.sh              → menú interactivo
#     sudo bash redmaastel.sh install      → instalación guiada
#     sudo bash redmaastel.sh update       → actualizar desde GitHub
#     sudo bash redmaastel.sh status|logs|restart|backup|stop
#
#  Configuración: .env.stack (secretos, NO se sube a git, permisos 600)
#  Datos:         volúmenes Docker  redmaastel_postgres_data / redmaastel_uploads
#  Backups:       ./backups/
# ══════════════════════════════════════════════════════════════════════

set -Eeuo pipefail

# ─── Rutas y constantes ──────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$APP_DIR/docker-compose.portainer.yml"
ENV_FILE="$APP_DIR/.env.stack"
BACKUP_DIR="$APP_DIR/backups"
PROJECT="redmaastel"
HEALTH_PATH="/api/v1/branches"
KEEP_BACKUPS=10

# ─── Estilo ──────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[0;34m'
C='\033[0;36m'; BD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

log()   { echo -e "${B}[$(date +%H:%M:%S)]${NC} $*"; }
ok()    { echo -e "  ${G}✓${NC} $*"; }
warn()  { echo -e "  ${Y}⚠${NC} $*"; }
err()   { echo -e "  ${R}✗${NC} $*" >&2; }
die()   { err "$*"; exit 1; }
hr()    { echo -e "${DIM}──────────────────────────────────────────────────────────${NC}"; }
pause() { echo; read -r -p "Presiona Enter para continuar..." _ || true; }

banner() {
  clear || true
  echo -e "${C}${BD}"
  echo "  ╔════════════════════════════════════════════════════╗"
  echo "  ║            RED MAASTEL  ·  Web + Panel             ║"
  echo "  ║          Instalador y gestor con Docker            ║"
  echo "  ╚════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

trap 'err "Falló la línea $LINENO: $BASH_COMMAND"' ERR

# ─── Utilidades ──────────────────────────────────────────────────────
dc() { docker compose -p "$PROJECT" -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"; }

need_root() { [ "$EUID" -eq 0 ] || die "Ejecuta como root:  sudo bash $0"; }
need_env()  { [ -f "$ENV_FILE" ] || die "No está instalado todavía (falta .env.stack). Usa la opción Instalar."; }

# Lee una variable de .env.stack (quita las comillas simples)
env_get() {
  [ -f "$ENV_FILE" ] || return 0
  { grep -E "^$1=" "$ENV_FILE" || true; } | tail -n1 | cut -d= -f2- | sed "s/^'//; s/'$//"
}

# Pregunta con valor por defecto:  ask VAR "Texto" "default"
ask() {
  local __var="$1" __msg="$2" __def="${3:-}" __val
  if [ -n "$__def" ]; then
    read -r -p "  $__msg [$__def]: " __val || true
    __val="${__val:-$__def}"
  else
    read -r -p "  $__msg: " __val || true
  fi
  printf -v "$__var" '%s' "$__val"
}

# Pregunta sí/no:  confirm "Texto" [s|n por defecto]
confirm() {
  local def="${2:-n}" ans hint="[s/N]"
  [ "$def" = "s" ] && hint="[S/n]"
  read -r -p "  $1 $hint: " ans || true
  ans="${ans:-$def}"
  [[ "$ans" =~ ^[sSyY]$ ]]
}

# Password oculta con confirmación:  ask_password VAR "Texto" minimo
ask_password() {
  local __var="$1" __msg="$2" __min="${3:-8}" p1 p2
  while true; do
    read -r -s -p "  $__msg (mín. $__min caracteres): " p1 || true; echo
    if [ "${#p1}" -lt "$__min" ]; then warn "Muy corta."; continue; fi
    if [[ "$p1" == *"'"* ]]; then warn "No uses comillas simples (')."; continue; fi
    read -r -s -p "  Repite la contraseña: " p2 || true; echo
    [ "$p1" = "$p2" ] && break
    warn "No coinciden, intenta de nuevo."
  done
  printf -v "$__var" '%s' "$p1"
}

rand_hex() { openssl rand -hex "$1"; }

port_in_use() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q .
  else
    netstat -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1$"
  fi
}

server_ip() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
  [ -n "$ip" ] || ip=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}' || true)
  echo "${ip:-127.0.0.1}"
}

is_running() { [ -f "$ENV_FILE" ] && [ -n "$(dc ps -q backend 2>/dev/null)" ]; }

# Espera a que la app responda en el puerto publicado
wait_healthy() {
  local port; port="$(env_get APP_PORT)"; port="${port:-8985}"
  local max="${1:-240}" i=0
  log "Esperando a que la app responda en el puerto $port (máx. ${max}s)..."
  while [ $i -lt "$max" ]; do
    if curl -fsS "http://127.0.0.1:$port$HEALTH_PATH" >/dev/null 2>&1; then
      ok "La app responde correctamente"
      return 0
    fi
    sleep 3; i=$((i + 3)); printf '.'
  done
  echo
  err "La app no respondió a tiempo. Últimos logs:"
  dc logs --tail=60 backend || true
  return 1
}

# ─── Requisitos del servidor ─────────────────────────────────────────
ensure_deps() {
  log "Verificando requisitos del servidor..."
  local pkgs=()
  for t in curl git openssl; do command -v "$t" >/dev/null 2>&1 || pkgs+=("$t"); done
  if [ ${#pkgs[@]} -gt 0 ]; then
    if command -v apt-get >/dev/null 2>&1; then
      apt-get update -qq && apt-get install -y -qq "${pkgs[@]}" >/dev/null
    elif command -v dnf >/dev/null 2>&1; then
      dnf install -y -q "${pkgs[@]}"
    elif command -v yum >/dev/null 2>&1; then
      yum install -y -q "${pkgs[@]}"
    else
      die "Instala manualmente: ${pkgs[*]}"
    fi
  fi
  ok "curl, git, openssl"

  if ! command -v docker >/dev/null 2>&1; then
    warn "Docker no está instalado."
    confirm "¿Instalar Docker automáticamente (get.docker.com)?" s || die "Docker es necesario."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker >/dev/null 2>&1 || true
  fi
  docker compose version >/dev/null 2>&1 || die "Falta Docker Compose v2 (actualiza Docker)."
  ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')  ·  Compose $(docker compose version --short)"

  # Git se queja si el repo pertenece a otro usuario (clonado sin sudo)
  git config --global --get-all safe.directory 2>/dev/null | grep -qx "$APP_DIR" \
    || git config --global --add safe.directory "$APP_DIR"

  [ -f "$COMPOSE_FILE" ] || die "No encuentro docker-compose.portainer.yml en $APP_DIR"
  [ -f "$APP_DIR/public/index.html" ] || die "Falta public/index.html (build del frontend). Ejecuta 'npm run web:build' en tu PC y súbelo a git."
}

# ─── Escribir .env.stack ─────────────────────────────────────────────
write_env() {
  [ -f "$ENV_FILE" ] && cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%Y%m%d-%H%M%S)"
  umask 077
  cat > "$ENV_FILE" <<EOF
# Generado por redmaastel.sh el $(date '+%Y-%m-%d %H:%M')
# NO SUBIR A GIT — contiene secretos.

APP_PORT='$APP_PORT'

DB_USERNAME='$DB_USERNAME'
DB_PASSWORD='$DB_PASSWORD'
DB_DATABASE='$DB_DATABASE'

JWT_SECRET='$JWT_SECRET'

CORS_ORIGIN='$CORS_ORIGIN'
COOKIE_SECURE='$COOKIE_SECURE'
COOKIE_DOMAIN=''

SEED_ADMIN_EMAIL='$SEED_ADMIN_EMAIL'
SEED_ADMIN_PASSWORD='$SEED_ADMIN_PASSWORD'
SEED_ADMIN_NAME='$SEED_ADMIN_NAME'
EOF
  chmod 600 "$ENV_FILE"
  umask 022
  ok "Configuración guardada en .env.stack (permisos 600)"
}

# Preguntas de acceso (puerto, dominio, https) → APP_PORT, CORS_ORIGIN, COOKIE_SECURE
ask_access() {
  local cur_port; cur_port="$(env_get APP_PORT)"
  local own_port="${cur_port:-}"
  while true; do
    ask APP_PORT "Puerto donde se publicará la web" "${cur_port:-8985}"
    [[ "$APP_PORT" =~ ^[0-9]+$ ]] && [ "$APP_PORT" -ge 1 ] && [ "$APP_PORT" -le 65535 ] || { warn "Puerto inválido."; continue; }
    if port_in_use "$APP_PORT" && ! { is_running && [ "$APP_PORT" = "$own_port" ]; }; then
      warn "El puerto $APP_PORT ya está en uso por otro servicio. Elige otro."
      continue
    fi
    break
  done

  local ip; ip="$(server_ip)"
  echo
  echo -e "  ${BD}¿Cómo se accederá a la web?${NC}"
  echo "    1) Por IP:      http://$ip:$APP_PORT"
  echo "    2) Por dominio con HTTPS (Nginx Proxy Manager, Traefik, Cloudflare…)"
  echo "    3) Ambos (dominio HTTPS + IP para pruebas)"
  local mode domain
  ask mode "Opción" "1"
  case "$mode" in
    2|3)
      while true; do
        ask domain "Dominio (sin https://, ej. www.redmaastel.ec)" "$(env_get CORS_ORIGIN | tr ',' '\n' | grep -m1 '^https://' | sed 's#https://##')"
        [[ "$domain" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
        warn "Dominio inválido."
      done
      CORS_ORIGIN="https://$domain"
      [ "$mode" = "3" ] && CORS_ORIGIN="$CORS_ORIGIN,http://$ip:$APP_PORT"
      COOKIE_SECURE="true"
      if [ "$mode" = "3" ]; then
        warn "Con HTTPS activo, el login solo funciona entrando por https://$domain"
        warn "Por la IP podrás ver la web pública, pero no iniciar sesión."
      fi
      echo -e "  ${DIM}Configura tu proxy para que https://$domain apunte a http://$ip:$APP_PORT${NC}"
      ;;
    *)
      CORS_ORIGIN="http://$ip:$APP_PORT"
      COOKIE_SECURE="false"
      ;;
  esac
}

# ─── 1) Instalar ─────────────────────────────────────────────────────
do_install() {
  banner; need_root; ensure_deps
  if [ -f "$ENV_FILE" ]; then
    warn "Ya existe una instalación (.env.stack)."
    confirm "¿Reinstalar? Se conservarán la base de datos y los archivos subidos" n || return 0
  fi

  hr; echo -e "${BD}  Configuración${NC}  ${DIM}(Enter = valor entre corchetes)${NC}"; echo

  ask_access
  echo

  # Base de datos — si ya existe, NO se cambia la password (rompería la conexión)
  if [ -n "$(env_get DB_PASSWORD)" ]; then
    DB_USERNAME="$(env_get DB_USERNAME)"; DB_DATABASE="$(env_get DB_DATABASE)"; DB_PASSWORD="$(env_get DB_PASSWORD)"
    ok "Base de datos existente: se mantienen usuario, nombre y contraseña"
  else
    ask DB_USERNAME "Usuario de PostgreSQL" "redmaastel"
    ask DB_DATABASE "Nombre de la base de datos" "redmaastelweb"
    DB_PASSWORD="$(rand_hex 24)"
    ok "Contraseña de la BD generada automáticamente"
  fi

  JWT_SECRET="$(env_get JWT_SECRET)"
  [ ${#JWT_SECRET} -ge 48 ] || JWT_SECRET="$(rand_hex 48)"

  echo
  echo -e "  ${BD}Super administrador${NC} ${DIM}(se crea solo la primera vez)${NC}"
  while true; do
    ask SEED_ADMIN_EMAIL "Email" "$(env_get SEED_ADMIN_EMAIL)"
    [[ "$SEED_ADMIN_EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] && break
    warn "Email inválido."
  done
  ask SEED_ADMIN_NAME "Nombre" "$(env_get SEED_ADMIN_NAME || true)"
  SEED_ADMIN_NAME="${SEED_ADMIN_NAME:-Super Admin}"
  if [ -n "$(env_get SEED_ADMIN_PASSWORD)" ] && confirm "¿Mantener la contraseña del admin guardada?" s; then
    SEED_ADMIN_PASSWORD="$(env_get SEED_ADMIN_PASSWORD)"
  else
    ask_password SEED_ADMIN_PASSWORD "Contraseña del admin" 8
  fi

  hr
  echo -e "${BD}  Resumen${NC}"
  printf "    %-16s %s\n" "Carpeta"    "$APP_DIR"
  printf "    %-16s %s\n" "Puerto"     "$APP_PORT"
  printf "    %-16s %s\n" "Acceso"     "$CORS_ORIGIN"
  printf "    %-16s %s\n" "HTTPS"      "$COOKIE_SECURE"
  printf "    %-16s %s\n" "Base datos" "$DB_DATABASE (usuario $DB_USERNAME)"
  printf "    %-16s %s\n" "Admin"      "$SEED_ADMIN_EMAIL"
  hr
  confirm "¿Continuar con la instalación?" s || { warn "Cancelado."; return 0; }

  write_env
  log "Construyendo la imagen (la primera vez tarda varios minutos)..."
  dc build || { err "Falló la construcción de la imagen (revisa el error arriba)."; return 1; }
  log "Levantando contenedores..."
  dc up -d --remove-orphans || { err "No se pudieron levantar los contenedores."; return 1; }
  if wait_healthy 300; then
    git -C "$APP_DIR" rev-parse --short HEAD > "$APP_DIR/.deployed-version" 2>/dev/null || true
    hr
    echo -e "${G}${BD}  ✓ Instalación completa${NC}"
    echo
    echo "    Web:    $(echo "$CORS_ORIGIN" | cut -d, -f1)"
    echo "    Panel:  $(echo "$CORS_ORIGIN" | cut -d, -f1)/login"
    echo "    Admin:  $SEED_ADMIN_EMAIL"
    echo
    echo -e "  ${DIM}Para actualizar más adelante:  sudo bash redmaastel.sh update${NC}"
  fi
}

# ─── 2) Actualizar ───────────────────────────────────────────────────
do_update() {
  banner; need_root; need_env; ensure_deps
  cd "$APP_DIR"

  local branch prev
  branch="$(git rev-parse --abbrev-ref HEAD)"
  prev="$(git rev-parse --short HEAD)"

  if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    warn "Hay archivos modificados en el servidor:"
    git status --short --untracked-files=no | sed 's/^/      /'
    confirm "¿Descartarlos y usar la versión de GitHub?" n || { warn "Actualización cancelada."; return 0; }
    git reset --hard -q HEAD
  fi

  log "Buscando cambios en GitHub (rama $branch)..."
  git fetch --quiet origin "$branch" || die "No se pudo conectar con GitHub. Si el repo es privado, revisa el token."
  local remote; remote="$(git rev-parse --short "origin/$branch")"
  if [ "$prev" = "$remote" ]; then
    ok "Ya estás en la última versión ($prev)."
    confirm "¿Reconstruir y reiniciar de todos modos?" n || return 0
  else
    echo; echo -e "  ${BD}Cambios nuevos:${NC}"
    git log --oneline --no-decorate "HEAD..origin/$branch" | head -20 | sed 's/^/    • /'
    echo
    confirm "¿Aplicar la actualización ($prev → $remote)?" s || return 0
  fi

  log "Backup de seguridad antes de actualizar..."
  do_backup quiet || { confirm "El backup falló. ¿Continuar igual?" n || return 1; }

  git merge --ff-only -q "origin/$branch" || die "No se pudo actualizar (historial distinto). Revisa con 'git status'."
  ok "Código actualizado a $(git rev-parse --short HEAD)"

  local healthy=false
  log "Reconstruyendo imagen..."
  if dc build; then
    log "Reiniciando la app (la BD no se toca; migraciones automáticas)..."
    dc up -d --remove-orphans && wait_healthy 240 && healthy=true
  else
    err "Falló la construcción de la nueva imagen. La versión anterior sigue funcionando."
  fi

  if [ "$healthy" = true ]; then
    git rev-parse --short HEAD > "$APP_DIR/.deployed-version"
    docker image prune -f >/dev/null 2>&1 || true
    hr; echo -e "${G}${BD}  ✓ Actualización completa${NC} ($prev → $(git rev-parse --short HEAD))"
  else
    warn "La nueva versión no arrancó bien."
    if confirm "¿Volver a la versión anterior ($prev)?" s; then
      git reset --hard -q "$prev"
      dc build && dc up -d
      wait_healthy 240 && ok "Se restauró la versión $prev" || err "Tampoco arrancó. Revisa los logs (opción Logs)."
      warn "Si la nueva versión aplicó migraciones, quizá necesites restaurar el backup de la BD (opción Restaurar)."
    fi
  fi
}

# ─── 3) Estado ───────────────────────────────────────────────────────
do_status() {
  need_env
  hr
  echo -e "${BD}  Estado${NC}"
  dc ps
  echo
  local port; port="$(env_get APP_PORT)"
  if curl -fsS "http://127.0.0.1:$port$HEALTH_PATH" >/dev/null 2>&1; then
    ok "La web responde en el puerto $port"
  else
    err "La web NO responde en el puerto $port"
  fi
  printf "    %-18s %s\n" "Versión desplegada" "$(cat "$APP_DIR/.deployed-version" 2>/dev/null || echo '?')"
  printf "    %-18s %s\n" "Acceso"            "$(env_get CORS_ORIGIN)"
  printf "    %-18s %s\n" "Último backup"     "$(ls -1t "$BACKUP_DIR" 2>/dev/null | head -n1 || echo 'ninguno')"
  docker system df 2>/dev/null | sed -n '1,3p' | sed 's/^/    /'
}

# ─── 4) Logs ─────────────────────────────────────────────────────────
do_logs() {
  need_env
  echo -e "  ${DIM}Ctrl+C para salir${NC}"
  dc logs -f --tail=200 backend || true
}

# ─── 5) Reiniciar ────────────────────────────────────────────────────
do_restart() {
  need_root; need_env
  log "Reiniciando..."
  dc up -d
  dc restart backend
  wait_healthy 180 || true
}

# ─── 6) Backup ───────────────────────────────────────────────────────
do_backup() {
  need_root; need_env
  local quiet="${1:-}" ts dir
  ts="$(date +%Y%m%d-%H%M%S)"; dir="$BACKUP_DIR/$ts"
  mkdir -p "$dir"; chmod 700 "$BACKUP_DIR"
  is_running || { err "La app no está corriendo; no se puede hacer backup."; return 1; }

  dc exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' \
    | gzip > "$dir/database.sql.gz"
  [ -s "$dir/database.sql.gz" ] || { err "El backup de la BD salió vacío."; return 1; }
  dc exec -T backend tar czf - -C /app/uploads . > "$dir/uploads.tar.gz"
  git -C "$APP_DIR" rev-parse --short HEAD > "$dir/version" 2>/dev/null || true

  ok "Backup: backups/$ts  ($(du -sh "$dir" | cut -f1))"
  # Rotación
  ls -1dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -rf
  [ -n "$quiet" ] || echo -e "  ${DIM}Se conservan los últimos $KEEP_BACKUPS backups.${NC}"
}

# ─── 7) Restaurar ────────────────────────────────────────────────────
do_restore() {
  need_root; need_env
  mapfile -t list < <(ls -1t "$BACKUP_DIR" 2>/dev/null)
  [ ${#list[@]} -gt 0 ] || { warn "No hay backups en $BACKUP_DIR"; return 0; }
  echo -e "  ${BD}Backups disponibles:${NC}"
  local i=1
  for b in "${list[@]}"; do printf "    %2d) %s  (versión %s)\n" "$i" "$b" "$(cat "$BACKUP_DIR/$b/version" 2>/dev/null || echo '?')"; i=$((i+1)); done
  local n; ask n "Número del backup a restaurar (0 = cancelar)" "0"
  [[ "$n" =~ ^[0-9]+$ ]] && [ "$n" -ge 1 ] && [ "$n" -le ${#list[@]} ] || { warn "Cancelado."; return 0; }
  local dir="$BACKUP_DIR/${list[$((n-1))]}"

  warn "Esto REEMPLAZA la base de datos y los archivos subidos actuales por los de ${list[$((n-1))]}."
  confirm "¿Seguro?" n || return 0
  log "Backup de lo actual por si acaso..."; do_backup quiet || true

  dc stop backend
  log "Restaurando base de datos..."
  dc exec -T postgres sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"'
  gunzip -c "$dir/database.sql.gz" | dc exec -T postgres sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null
  ok "Base de datos restaurada"

  if [ -f "$dir/uploads.tar.gz" ]; then
    log "Restaurando archivos subidos..."
    dc run --rm -T --no-deps --entrypoint sh backend -c 'rm -rf /app/uploads/* && tar xzf - -C /app/uploads' < "$dir/uploads.tar.gz"
    ok "Archivos restaurados"
  fi
  dc up -d
  wait_healthy 180 || true
}

# ─── 8) Cambiar configuración ────────────────────────────────────────
do_config() {
  banner; need_root; need_env
  echo -e "  ${BD}Configuración actual${NC}"
  printf "    %-14s %s\n" "Puerto" "$(env_get APP_PORT)" "Acceso" "$(env_get CORS_ORIGIN)" "HTTPS" "$(env_get COOKIE_SECURE)" "Admin" "$(env_get SEED_ADMIN_EMAIL)"
  echo
  echo -e "  ${DIM}Nota: el email/contraseña del admin solo se usan al crear el primer usuario.${NC}"
  echo -e "  ${DIM}Para cambiarlos después, hazlo desde el panel (Perfil / Usuarios).${NC}"
  echo
  confirm "¿Cambiar puerto / dominio / HTTPS?" s || return 0
  ask_access
  DB_USERNAME="$(env_get DB_USERNAME)"; DB_PASSWORD="$(env_get DB_PASSWORD)"; DB_DATABASE="$(env_get DB_DATABASE)"
  JWT_SECRET="$(env_get JWT_SECRET)"
  SEED_ADMIN_EMAIL="$(env_get SEED_ADMIN_EMAIL)"; SEED_ADMIN_PASSWORD="$(env_get SEED_ADMIN_PASSWORD)"; SEED_ADMIN_NAME="$(env_get SEED_ADMIN_NAME)"
  write_env
  log "Aplicando cambios..."
  dc up -d
  wait_healthy 180 || true
}

# ─── 9) Detener ──────────────────────────────────────────────────────
do_stop() {
  need_root; need_env
  confirm "¿Detener la web? (los datos se conservan)" n || return 0
  dc stop; ok "Detenida. Para encenderla: opción Reiniciar."
}

# ─── 10) Desinstalar ─────────────────────────────────────────────────
do_uninstall() {
  need_root; need_env
  warn "Se eliminarán los contenedores de Red MaasTel."
  confirm "¿Continuar?" n || return 0
  if confirm "¿Hacer un backup antes?" s; then do_backup quiet || true; fi
  if confirm "¿Borrar TAMBIÉN la base de datos y los archivos subidos? (irreversible)" n; then
    local txt; ask txt "Escribe BORRAR para confirmar" ""
    if [ "$txt" = "BORRAR" ]; then dc down -v --rmi local; ok "Contenedores, datos e imagen eliminados"
    else warn "No confirmado: se conservan los datos."; dc down; fi
  else
    dc down; ok "Contenedores eliminados (datos conservados en volúmenes)"
  fi
  echo -e "  ${DIM}La carpeta $APP_DIR, .env.stack y backups/ no se tocaron.${NC}"
}

# ─── Menú ────────────────────────────────────────────────────────────
menu() {
  need_root
  while true; do
    banner
    if [ -f "$ENV_FILE" ]; then
      local st="${R}detenida${NC}"; is_running && st="${G}en ejecución${NC}"
      echo -e "  Estado: $st  ·  Puerto $(env_get APP_PORT)  ·  Versión $(cat "$APP_DIR/.deployed-version" 2>/dev/null || echo '?')"
    else
      echo -e "  Estado: ${Y}no instalada${NC}"
    fi
    hr
    echo "   1) Instalar / reinstalar"
    echo "   2) Actualizar desde GitHub"
    echo "   3) Ver estado"
    echo "   4) Ver logs en vivo"
    echo "   5) Reiniciar / encender"
    echo "   6) Hacer backup (BD + archivos)"
    echo "   7) Restaurar un backup"
    echo "   8) Cambiar puerto / dominio / HTTPS"
    echo "   9) Detener"
    echo "  10) Desinstalar"
    echo "   0) Salir"
    hr
    local op; read -r -p "  Elige una opción: " op || exit 0
    echo
    case "$op" in
      1) do_install   || true; pause ;;
      2) do_update    || true; pause ;;
      3) do_status    || true; pause ;;
      4) do_logs      || true ;;
      5) do_restart   || true; pause ;;
      6) do_backup    || true; pause ;;
      7) do_restore   || true; pause ;;
      8) do_config    || true; pause ;;
      9) do_stop      || true; pause ;;
      10) do_uninstall || true; pause ;;
      0|q|Q) exit 0 ;;
      *) warn "Opción inválida"; sleep 1 ;;
    esac
  done
}

case "${1:-}" in
  install)   do_install ;;
  update)    do_update ;;
  status)    do_status ;;
  logs)      do_logs ;;
  restart)   do_restart ;;
  backup)    do_backup ;;
  restore)   do_restore ;;
  config)    do_config ;;
  stop)      do_stop ;;
  uninstall) do_uninstall ;;
  ""|menu)   menu ;;
  -h|--help) sed -n '2,14p' "$0" ;;
  *)         die "Comando desconocido: $1  (usa --help)" ;;
esac
