# Desplegar a producción

```
npm run deploy
```

desde la raíz del repo. Eso es todo — el script (`deploy/deploy.sh`):

1. Verifica que estés en `main` y sin cambios sin commitear (nunca commitea por ti).
2. Corre typecheck + tests + build de backend y frontend localmente — si algo falla, no toca el servidor.
3. Sube `main` a `origin`.
4. Se conecta al servidor por SSH, hace `git pull`, reconstruye las imágenes de backend y frontend.
5. Corre las migraciones pendientes y sincroniza el catálogo de permisos (`seed`).
6. Reinicia backend y frontend — **nunca toca el contenedor de postgres**.
7. Verifica con un health check (`/api/v1/health` y `/`) que el commit que quedó corriendo en el servidor es el mismo que acabas de desplegar.

Si cualquier paso falla, el script se detiene ahí (`set -euo pipefail`) — no sigue a medias.

## Requisitos (una sola vez)

- La llave SSH del servidor en `~/.ssh/golden_bites_oracle` (o la ruta que pongas en `GB_DEPLOY_SSH_KEY`).
- Acceso de escritura al repo en GitHub (para el `git push`).

## Variables de entorno opcionales

Todas tienen un valor por defecto ya configurado para este proyecto — solo hace falta tocarlas si algo cambia (otro servidor, otra llave, etc.):

| Variable | Por defecto |
|---|---|
| `GB_DEPLOY_SSH_KEY` | `~/.ssh/golden_bites_oracle` |
| `GB_DEPLOY_SSH_HOST` | `ubuntu@157.137.220.21` |
| `GB_DEPLOY_REMOTE_DIR` | `/opt/golden-bites/app` |
| `GB_DEPLOY_HEALTH_URL` | `http://goldenbites.duckdns.org` |
| `GB_DEPLOY_BRANCH` | `main` |

Ejemplo para apuntar a otro servidor sin editar el script:
```
GB_DEPLOY_SSH_HOST=ubuntu@1.2.3.4 npm run deploy
```
