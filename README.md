# Red MaasTel — Web + API

Un solo proyecto, un solo `package.json`, un solo `npm install`.
La API NestJS sirve también la web React ya compilada.

```text
redmaastel_web/
├── src/                          API NestJS (backend)
├── client/                       Web React (frontend)
│   ├── src/
│   ├── public/                   favicon, iconos
│   ├── index.html
│   └── .env                      variables VITE_* (EmailJS, WhatsApp…)
├── public/                       Build de la web ← lo genera `npm run web:build` y SÍ se sube a git
├── redmaastel.sh                 Instalador + menú de gestión en el servidor
├── docker/Dockerfile             Imagen de producción
├── docker-compose.portainer.yml  Stack para Portainer (puerto 8985)
├── docker-compose.yml            Solo PostgreSQL para desarrollo local
├── vite.config.mjs               Config del frontend
├── .env                          variables del backend
└── package.json
```

En producción un solo contenedor sirve la web en `/`, la API en `/api/v1`
y los archivos subidos en `/static`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala todo (back + front) |
| `npm run dev` | Levanta API (:3000) y web (:5173) a la vez |
| `npm run start:dev` | Solo la API |
| `npm run web:dev` | Solo la web |
| `npm run web:build` | Compila la web y la deja en `public/` |
| `npm run build` | Compila la API a `dist/` |
| `npm run migration:run` | Aplica migraciones de BD |

## Desarrollo local (primera vez)

```bash
npm install
cp .env.example .env                 # variables del backend
cp client/.env.example client/.env   # variables del frontend
docker compose up -d                 # PostgreSQL local (opcional)
npm run migration:run
npm run dev                          # abre http://localhost:5173
```

## Publicar cambios

```bash
npm run web:build                    # SOLO si cambiaste algo en client/
git add . && git commit -m "Descripción del cambio"
git push
```

Luego en el servidor: `sudo bash redmaastel.sh update` (o opción **2** del menú).

> Si cambiaste el frontend y no corres `npm run web:build`, el servidor seguirá
> mostrando la versión anterior de la web.

## Despliegue en el servidor (instalador)

Requisitos: un servidor Linux (Ubuntu/Debian recomendado) con acceso root.
Docker se instala solo si no está.

```bash
# 1. Clonar el repo (si es privado, GitHub te pedirá usuario + token)
sudo git clone https://github.com/TU_USUARIO/TU_REPO.git /opt/redmaastel
cd /opt/redmaastel

# 2. Ejecutar el instalador y elegir "1) Instalar"
sudo bash redmaastel.sh
```

El instalador pregunta: puerto (8985 por defecto), si se accede por IP o por dominio
con HTTPS, y los datos del super admin. La contraseña de la BD y el `JWT_SECRET` se
generan solos y se guardan en `.env.stack` (no se sube a git).

### Menú

```text
 1) Instalar / reinstalar          6) Hacer backup (BD + archivos)
 2) Actualizar desde GitHub        7) Restaurar un backup
 3) Ver estado                     8) Cambiar puerto / dominio / HTTPS
 4) Ver logs en vivo               9) Detener
 5) Reiniciar / encender          10) Desinstalar
```

También sin menú: `sudo bash redmaastel.sh update|status|logs|restart|backup|restore|config|stop`.

**Actualizar** hace: backup automático → `git pull` → reconstruye la imagen → reinicia →
comprueba que responde. Si la versión nueva no arranca, ofrece volver a la anterior.
La BD y los archivos subidos viven en volúmenes Docker y **no se pierden**; las migraciones
nuevas se aplican solas.

Los contenedores aparecen en Portainer como stack `redmaastel` (para ver logs/estado).
No crees además un stack desde Portainer con el mismo repo: usa uno de los dos métodos.

### Repo privado: evitar que pida contraseña en cada actualización

```bash
cd /opt/redmaastel
sudo git remote set-url origin https://TU_USUARIO:TU_TOKEN@github.com/TU_USUARIO/TU_REPO.git
```

## Dominio con HTTPS

En el instalador elige la opción "dominio con HTTPS" y configura tu proxy
(Nginx Proxy Manager, Traefik, Caddy…) para que `https://tudominio.com` apunte a
`http://IP_DEL_SERVIDOR:8985`.

## Alternativa: stack de Portainer desde Git

Portainer → **Stacks → Add stack → Repository**, compose path
`docker-compose.portainer.yml`, y define en *Environment variables*: `DB_PASSWORD`,
`JWT_SECRET` (≥ 48 caracteres), `CORS_ORIGIN`, `COOKIE_SECURE`, `SEED_ADMIN_EMAIL`,
`SEED_ADMIN_PASSWORD` (y opcional `APP_PORT`). Para actualizar: **Pull and redeploy**.

## Otros métodos (antiguos)

`docker-compose.prod.yml` + `scripts/deploy.sh` (nginx propio en 80/443) y
`scripts/install.sh` / `scripts/update.sh` (PM2 sin Docker) son el método anterior.
