# Verificación automática de transferencias Bancolombia

Confirma automáticamente que una transferencia Bancolombia fue recibida, leyendo las
notificaciones que el banco envía por correo, y marca el pedido como pagado sin
intervención del cajero salvo cuando hay ambigüedad (ver "Matching" más abajo).

Apagado por completo por defecto (`BANK_VERIFICATION_ENABLED=false`): las rutas
devuelven 404 y el botón no aparece en el POS.

## 1. Crear las credenciales OAuth en Google Cloud

1. Entra a [console.cloud.google.com](https://console.cloud.google.com) y crea (o
   reutiliza) un proyecto.
2. **APIs & Services → Library**: activa "Gmail API".
3. **APIs & Services → OAuth consent screen**: tipo "External" está bien si sólo tú vas
   a autorizar la cuenta; agrega tu correo como "Test user" si el consent screen queda
   en modo prueba (no hace falta publicarlo).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**, tipo
   "Web application". En "Authorized redirect URIs" agrega exactamente el valor de
   `GMAIL_OAUTH_REDIRECT_URI` (por defecto `http://localhost:3000/oauth2callback`).
5. Copia el "Client ID" y "Client secret" a tu `.env`:
   ```
   GMAIL_OAUTH_CLIENT_ID=...
   GMAIL_OAUTH_CLIENT_SECRET=...
   ```

## 2. Autorizar la cuenta de correo que recibe las alertas

Con `GMAIL_OAUTH_CLIENT_ID`/`GMAIL_OAUTH_CLIENT_SECRET` ya en `.env`:

```
npm run gmail:authorize
```

Abre el link que imprime, inicia sesión con la cuenta de Gmail que recibe los correos
de Bancolombia, acepta el permiso de solo lectura. El script captura la redirección e
imprime un `GMAIL_OAUTH_REFRESH_TOKEN` — pégalo en tu `.env`. No se guarda usuario ni
contraseña del correo en ningún momento; sólo este refresh token de OAuth 2.0, y sólo
como variable de entorno.

## 3. Configurar los filtros de remitente y asunto

```
BANK_EMAIL_SENDER_ALLOWLIST=alertasynotificaciones@bancolombia.com.co
BANK_EMAIL_SUBJECT_FILTER=Comprobante de transferencia
```

`BANK_EMAIL_SENDER_ALLOWLIST` valida la dirección real del remitente (no el nombre
visible). **Estos valores de ejemplo no están confirmados contra un correo real de
Bancolombia** — ajústalos, y sobre todo ajusta las reglas de extracción en
`BancolombiaNotificationParser` (`GB-BE/src/modules/bank-transactions/providers/bancolombia-email/bancolombia-notification.parser.ts`),
en cuanto tengas un correo real y anonimizado para calibrar contra él.

## 4. El negocio y la ventana de coincidencia

```
BANK_VERIFICATION_BUSINESS_ID=<uuid del negocio dueño de esta cuenta Bancolombia>
BANK_VERIFICATION_MATCH_WINDOW_MINUTES=120
BANK_VERIFICATION_MATCH_BACKWARD_TOLERANCE_MINUTES=5
```

Un buzón de correo = una cuenta bancaria = un negocio. Encuentra el id con
`SELECT id, name FROM businesses;`.

## 5. Correr todo localmente

```
BANK_VERIFICATION_ENABLED=true
BANK_VERIFICATION_PROVIDER=mock   # ver sección 6 — no necesita Gmail para probar el flujo
```

y en `GB/.env.development`:
```
VITE_BANK_VERIFICATION_ENABLED=true
```

## 6. Activar `MockBankTransactionProvider` y probar sin correos reales

Con `BANK_VERIFICATION_PROVIDER=mock` (el default), en vez de leer Gmail el backend
simula transferencias vía:

```
POST /api/v1/dev/bank-transactions/simulate
{ "amount": 38500 }
```

Este endpoint no existe en absoluto si `NODE_ENV=production` (404 duro), sin importar
qué diga `BANK_VERIFICATION_PROVIDER` — no puede quedar activo por accidente.

## 7. Probar una transferencia (con el mock)

1. Backend corriendo con `BANK_VERIFICATION_ENABLED=true`, `BANK_VERIFICATION_PROVIDER=mock`.
2. En el POS, abre un pedido con saldo pendiente y haz clic en **"Cobrar con
   transferencia Bancolombia"** — el pedido entra en estado de espera
   ("Esperando transferencia... $X / Verificando pago...").
3. Simula el pago (monto exacto del saldo pendiente):
   ```
   curl -X POST http://localhost:3000/api/v1/dev/bank-transactions/simulate \
     -H "Authorization: Bearer <tu token>" -H "Content-Type: application/json" \
     -d '{"amount": <saldo pendiente>}'
   ```
4. En unos segundos (polling de ~5s) el pedido pasa solo a "✓ Pago confirmado", sin
   recargar la página.

## 8. Pasar a producción

1. `BANK_VERIFICATION_PROVIDER=gmail` (el arranque falla si dejas `mock` con
   `NODE_ENV=production` — es intencional).
2. Repite los pasos 1–4 con las credenciales/refresh token reales de producción.
3. Verifica `BANK_EMAIL_SENDER_ALLOWLIST` contra la dirección real del remitente.
4. **Antes de confiar en el parser en producción, calibra
   `BancolombiaNotificationParser` con un correo real y anonimizado** — el que hay
   ahora usa reglas provisionales sobre un fixture ficticio
   (`GB-BE/src/modules/bank-transactions/providers/bancolombia-email/fixtures/sample-notification.fixture.ts`),
   claramente marcado como tal.
5. `BANK_VERIFICATION_POLL_INTERVAL_MS` por defecto es 30s — súbelo si el volumen de
   correos es alto, bájalo si quieres confirmaciones más rápidas.
