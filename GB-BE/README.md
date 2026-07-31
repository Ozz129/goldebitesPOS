# Golden Bites — Backend

Backend de administración para el restaurante **Golden Bites**: pedidos, cocina,
caja, productos, recetas, inventario, compras, proveedores, clientes,
fidelización, empleados, turnos, checklists, desperdicios, mantenimiento,
documentos, marketing, analítica y configuración.

> **Estado actual: FASE 3 — Catálogo.** Implementadas la fundación técnica
> (Fase 1), la capa de seguridad multi-negocio (Fase 2: businesses, branches,
> roles, permissions, users, auth) y el catálogo de producto (Fase 3):
> categorías, productos, insumos (catálogo de inventario), proveedores y
> recetas con costeo automático. Inventario (movimientos/kardex), compras,
> ventas, etc. se añadirán en fases posteriores.

## Stack tecnológico

- Node.js + TypeScript
- NestJS
- PostgreSQL, accedido **directamente con `pg`** — sin ORM (no Prisma, no
  TypeORM, no Sequelize). Todas las consultas son SQL parametrizado.
- class-validator / class-transformer
- Passport + JWT + bcrypt
- Swagger / OpenAPI
- Helmet, Compression, CORS, Throttler (rate limiting)
- Jest + Supertest
- ESLint + Prettier
- Docker / Docker Compose

## Arquitectura

Arquitectura modular inspirada en Clean Architecture. Cada módulo de negocio
vive en `src/modules/<module>/` con esta forma:

```
src/modules/<module>/
├── controllers/     # HTTP, validación de parámetros, sin SQL ni lógica de negocio
├── services/        # Reglas de negocio, transacciones, coordinación de repos
├── repositories/     # SQL parametrizado sobre el pool de pg (interface + implementación)
├── dto/              # class-validator + Swagger
├── domain/           # Interfaces, tipos, enums propios del módulo
├── mappers/          # Fila de BD -> entidad de dominio
├── <module>.module.ts
└── strategies/, repositories/... (según el módulo)
```

Estructura global del proyecto:

```
src/
├── main.ts                 # Bootstrap: Helmet, compression, CORS, Swagger, ValidationPipe
├── app.module.ts            # Registra módulos + guards globales (Throttler, Jwt, Roles, Permissions)
├── config/                  # app.config, database.config, env.validation
├── database/                 # DatabaseModule, DatabaseService, TransactionService, migraciones, seed-runner
├── common/
│   ├── decorators/            # @Public, @Roles, @Permissions, @CurrentUser, @CurrentBusiness, @CurrentBranch, @RawResponse
│   ├── guards/                 # JwtAuthGuard, RolesGuard, PermissionsGuard
│   ├── constants/               # Catálogo de roles y permisos del sistema
│   ├── interfaces/               # AuthenticatedUser (forma de request.user)
│   ├── filters/, interceptors/, middleware/, exceptions/, pagination/, utils/
└── modules/
    ├── health/                  # Health/ready/live (público)
    ├── audit/                    # AuditService.record() + GET /audit-logs (consulta del rastro de auditoría)
    ├── permissions/                # Catálogo de permisos (solo lectura)
    ├── roles/                       # CRUD de roles + asignación de permisos por negocio
    ├── businesses/                   # Alta de negocios (bootstrapping) + gestión del propio negocio
    ├── branches/                      # CRUD de sedes
    ├── users/                          # CRUD de usuarios, cambio de rol/sede, soft delete
    ├── auth/                            # login, refresh, logout, change/forgot/reset password
    ├── product-categories/               # CRUD de categorías, orden de despliegue
    ├── products/                          # CRUD de productos, margen, disponibles para venta
    ├── suppliers/                          # CRUD de proveedores
    ├── inventory-items/                     # Catálogo de insumos
    ├── recipes/                              # Receta 1:1 por producto, anidada bajo /products/:id/recipe
    ├── inventory-locations/                   # Ubicaciones de almacenamiento dentro de una sede
    ├── inventory-movements/                    # Kardex, stock derivado, alertas de bajo stock, ajustes manuales
    ├── inventory-transfers/                     # Traslados entre sede/ubicación (PENDING → COMPLETED/CANCELLED)
    ├── inventory-counts/                         # Conteos físicos: snapshot, registro, cierre con ajuste automático
    ├── purchases/                                 # Órdenes de compra (DRAFT → ... → RECEIVED/CANCELLED)
    ├── goods-receipts/                             # Recepción total/parcial de órdenes de compra
    ├── customers/                                   # CRUD de clientes + direcciones guardadas
    ├── cash-sessions/                                 # Apertura/cierre de caja, movimientos manuales
    ├── orders/                                         # Pedidos: ítems, transición de estado, consumo/reversión de stock
    ├── kitchen/                                         # Vista de cocina: cola activa + transición restringida (PREPARING/READY)
    ├── payments/                                         # Pagos anidados en /orders/:id/payments, ligados a caja si es CASH
    ├── waste/                                             # Mermas: registro + movimiento WASTE de inventario
    ├── settings/                                           # Configuración operativa del negocio (tax_rate)
    ├── dashboard/                                           # Resumen operativo: ventas de hoy, pedidos activos, stock bajo, caja
    └── analytics/                                            # Ventas por día y top productos en un rango de fechas

database/
├── migrations/               # 001-020, ejecutadas por el migration runner
└── seeds/                    # *.sql opcionales; el bootstrap de Golden Bites vive en seed-runner.ts

test/
├── auth-flow.e2e-spec.ts               # Login, permisos, refresh rotation, conflictos — contra BD real
├── catalog-flow.e2e-spec.ts            # Categorías, insumos, productos, recetas, costeo, proveedores
├── inventory-purchases-flow.e2e-spec.ts # Ubicaciones, ajustes, traslados, conteos, compras, recepciones
├── sales-flow.e2e-spec.ts              # Caja, clientes, pedidos, cocina, pagos, cierre de caja
├── settings-audit-flow.e2e-spec.ts     # tax_rate aplicado a compras/ventas + consulta de audit-logs
├── reporting-flow.e2e-spec.ts          # Dashboard summary + analytics/sales + analytics/top-products
└── app.e2e-spec.ts                     # Health checks y formato de error 404
```

### Decisiones importantes

- **Sin ORM.** Todo acceso a datos pasa por `DatabaseService.query()` (usa
  `pg.Pool`) con SQL parametrizado (`$1, $2, ...`). Nunca se concatenan
  valores en el SQL.
- **Transacciones explícitas.** `TransactionService.execute(async (client) =>
  {...})` abre `BEGIN`, ejecuta el trabajo, hace `COMMIT` o `ROLLBACK` y
  siempre libera el cliente. Los repositorios aceptan un `client` opcional
  para participar en la misma transacción. Se usa, por ejemplo, al crear un
  negocio: la creación del registro y el aprovisionamiento de sus 7 roles de
  sistema ocurren en una sola transacción.
- **Migraciones SQL propias**, sin herramientas de terceros. Un runner
  (`src/database/migration-runner.ts`) lee `database/migrations/*.sql` en
  orden, calcula un checksum SHA-256 por archivo, y solo ejecuta las
  pendientes dentro de una transacción. Si el contenido de una migración ya
  aplicada cambia, el runner falla en vez de reaplicarla silenciosamente.
- **Multi-negocio real.** `businesses` es la raíz del tenant; `branches`,
  `roles`, `users` y todo lo que vendrá después cuelgan de `business_id`.
  `roles` está scoped por negocio (`UNIQUE(business_id, name)`) — cada
  negocio tiene su propio catálogo de roles (SUPER_ADMIN, OWNER, MANAGER,
  CASHIER, KITCHEN, INVENTORY, EMPLOYEE), aprovisionado automáticamente al
  crear el negocio. `permissions` es un catálogo global (`orders.create`,
  `cash.open`, etc.) y `role_permissions` es la tabla puente — deliberadamente
  relacional, no JSON.
- **Nunca confiar en `business_id`/`branch_id` del cliente.** Los controllers
  los obtienen exclusivamente de `@CurrentBusiness()`/`@CurrentBranch()`,
  que leen el JWT ya validado (`request.user`), nunca del body/query.
- **Autenticación JWT + refresh token opaco.** El access token es un JWT
  firmado (HS256) con `{ sub, businessId, branchId, roleId, roleName,
  permissions }`, vida corta (`JWT_ACCESS_EXPIRES_IN`, default 15m). El
  refresh token es una cadena aleatoria de 48 bytes — nunca un JWT — cuyo
  hash SHA-256 se guarda en `refresh_tokens`; el valor en claro solo lo ve el
  cliente. Cada uso de `/auth/refresh` **rota** el token (revoca el usado,
  emite uno nuevo), y `/auth/logout` lo revoca explícitamente.
- **Autorización por permisos, no solo por rol.** `PermissionsGuard` exige
  que el usuario tenga *todos* los códigos declarados vía `@Permissions(...)`
  en el JWT (que a su vez vienen de `role_permissions`, recalculados en cada
  login/refresh). `RolesGuard` (`@Roles('SUPER_ADMIN')`) se reserva para
  casos donde la regla es genuinamente sobre el rol (p. ej. crear un negocio
  nuevo, una operación que por definición no puede scoparse a un
  `business_id` existente).
- **Errores estandarizados.** Un `GlobalExceptionFilter` único traduce
  `DomainException` (errores de negocio), `HttpException` (Nest/validación) y
  errores de PostgreSQL (por código SQLSTATE: `unique_violation`,
  `foreign_key_violation`, `not_null_violation`, `check_violation`) al mismo
  formato de respuesta, sin filtrar detalles internos al cliente.
- **Respuesta HTTP estándar.** Un `ResponseInterceptor` envuelve toda
  respuesta exitosa en `{ success, data, meta, timestamp }`. Los endpoints
  que no deben envolverse (p. ej. `/health`, `DELETE` con 204) usan
  `@RawResponse()`.
- **Paginación reutilizable.** `PaginationQueryDto` + `pagination.util.ts`
  centralizan `page/limit/sortBy/sortOrder/search`, con `resolveSortColumn()`
  forzando una whitelist de columnas para evitar inyección vía `ORDER BY`.
- **Auditoría ligera.** `AuditService.record()` (sin interceptor global aún)
  registra en `audit_logs` altas/bajas/cambios de negocios, sedes, usuarios y
  eventos de auth (login, refresh, cambio/reset de contraseña). Nunca
  registra contraseñas ni tokens.
- **Soft delete de usuarios.** `DELETE /users/:id` marca `deleted_at`, nunca
  borra la fila. Los queries de lectura siempre filtran `deleted_at IS NULL`.
- **El esquema completo ya existía cuando empezó la Fase 2.** Al iniciar esa
  fase se encontraron 24 tablas ya creadas en `golden_bites` (fuera de
  nuestro sistema de migraciones) cubriendo prácticamente todo el dominio del
  proyecto — incluyendo `product_categories`, `products`, `recipes`,
  `recipe_items`, `suppliers` e `inventory_items`, que son exactamente lo que
  necesitaba la Fase 3. Tras confirmarlo con el usuario, ese esquema se
  capturó fielmente en las migraciones 002-014 (ver decisión de permisos
  relacionales más abajo) para que las migraciones fueran la única fuente de
  verdad. Por eso la Fase 3 no agrega tablas nuevas — solo la capa de
  aplicación sobre tablas que ya existían.
- **Dinero y cantidades como NUMERIC, nunca FLOAT.** `sale_price`,
  `current_cost`, `minimum_stock`, `quantity`, etc. son columnas `NUMERIC` en
  Postgres. El driver `pg` las devuelve como `string` (para no perder
  precisión); los mappers hacen `parseFloat()` una sola vez al convertir la
  fila de BD a la entidad de dominio expuesta por la API. **Cuidado real
  encontrado:** `COALESCE($n, 0)` con un parámetro `NUMERIC` falla en
  Postgres — el literal `0` se infiere como `integer`, y Postgres tipa el
  parámetro para que coincida, rechazando luego valores decimales como `0.8`
  ("invalid input syntax for type integer"). La corrección es castear el
  parámetro explícitamente: `COALESCE($n::numeric, 0)`. Ver
  `inventory-items/repositories`, `products/repositories` y
  `recipes/repositories`, y sus pruebas de integración que fijan esta
  regresión.
- **Costeo de recetas.** `recipe_items` conecta una receta con `inventory_items`
  y su cantidad; el costo total se calcula en SQL
  (`SUM(quantity * current_cost)`), nunca acumulando floats en JS. Al crear o
  reemplazar los ingredientes de una receta (`PUT .../recipe/items`),
  `RecipesService` sincroniza automáticamente `products.current_cost` dentro
  de la misma transacción — el costo del producto nunca queda desactualizado
  respecto a su receta.
- **El stock nunca se guarda como columna.** Es siempre la suma de
  `inventory_movements`, expuesta por la vista SQL `inventory_stock_view`
  (`GROUP BY business_id, branch_id, location_id, inventory_item_id`). Los
  tipos de movimiento entrantes (`PURCHASE`, `ADJUSTMENT_IN`, `TRANSFER_IN`,
  `RETURN`, `INITIAL_STOCK`) suman; los salientes (`SALE_CONSUMPTION`,
  `WASTE`, `ADJUSTMENT_OUT`, `TRANSFER_OUT`) restan (ver
  `OUTBOUND_MOVEMENT_TYPES` en `inventory-movements/domain`).
  `InventoryMovementsService.recordMovement()` es el **único punto de
  escritura** de movimientos en todo el sistema — valida stock suficiente
  para salidas (a nivel de sede, sumando todas las ubicaciones) y lo usan
  `InventoryTransfersService`, `InventoryCountsService` y
  `GoodsReceiptsService`. No existe un tipo `COUNT_CORRECTION` separado: los
  ajustes de un conteo reutilizan `ADJUSTMENT_IN`/`ADJUSTMENT_OUT` con
  `reference_type = 'inventory_count'`.
- **Traslados y conteos como máquinas de estado explícitas.**
  `inventory_transfers` (`PENDING → COMPLETED/CANCELLED`) e
  `inventory_counts` (`IN_PROGRESS → COMPLETED/CANCELLED`) validan la
  transición en el servicio antes de tocar la BD. Completar un traslado
  registra `TRANSFER_OUT` en el origen y `TRANSFER_IN` en el destino dentro
  de una sola transacción; completar un conteo compara `expected_quantity`
  (snapshot tomado al iniciar) contra `counted_quantity` y solo genera un
  movimiento por ítem si hay diferencia — los ítems nunca contados se omiten
  (cierre parcial permitido).
- **Órdenes de compra y recepciones.** `purchase_orders` sigue
  `DRAFT → SUBMITTED → APPROVED → (PARTIALLY_RECEIVED) → RECEIVED`, con
  `CANCELLED` alcanzable desde cualquier estado previo a `RECEIVED` (una
  orden `APPROVED` con recepciones ya registradas no se puede cancelar). El
  número de orden (`PO-000123`) sale de una secuencia de Postgres dedicada
  (`purchase_order_number_sequence`). La cantidad recibida por línea
  (`purchase_order_items`) **no se guarda como columna**: se deriva sumando
  `goods_receipt_items` vía `LEFT JOIN`, siguiendo la misma filosofía de
  "los movimientos son la fuente de verdad". Cada recepción
  (`POST /goods-receipts`) valida que no se reciba más de lo pendiente,
  registra un movimiento `PURCHASE` por ítem, sincroniza
  `inventory_items.current_cost` con el último costo recibido ("gana el
  último costo"), y actualiza el estado de la orden a `PARTIALLY_RECEIVED` o
  `RECEIVED` dentro de la misma transacción.
- **Bug real de Postgres encontrado y corregido en Fase 4:** un `UPDATE`
  que usaba el mismo parámetro (`$3`) tanto en `status = $3` (columna
  `VARCHAR(30)`) como en `CASE WHEN $3 IN ('COMPLETED', 'CANCELLED')`
  fallaba con `inconsistent types deduced for parameter $3` porque Postgres
  infería `$3` como `text` en la comparación `IN` y como `character
  varying` en la asignación. Un cast a `::text` tampoco alcanza — hay que
  castear al tipo exacto de la columna: `$3::varchar IN (...)`. Corregido en
  `inventory-transfers/repositories` e `inventory-counts/repositories`, con
  pruebas de integración que fijan la regresión.
- **El esquema de ventas/caja/clientes/mermas ya existía** desde el mismo
  descubrimiento de Fase 2 (migraciones 009-012: `customers`,
  `customer_addresses`, `orders`, `order_items`, `order_status_history`,
  `payments`, `cash_sessions`, `cash_movements`, `waste_records`). La Fase 5
  no agregó migraciones nuevas — solo la capa de aplicación.
- **`order_items` y `payments` guardan snapshots, nunca referencias vivas.**
  `product_name_snapshot`, `unit_price` y `unit_cost_snapshot` se copian del
  producto al crear el pedido; cambios posteriores en `products` nunca
  alteran pedidos históricos. `order_number` es un `BIGINT` secuencial
  (`order_number_sequence`), no un UUID.
- **Máquina de estados de pedidos:**
  `PENDING → CONFIRMED → PREPARING → READY → DELIVERED`, con `CANCELLED`
  alcanzable desde cualquier estado previo a `DELIVERED`
  (`InvalidOrderStatusTransitionException`, reservada desde la Fase 1). El
  consumo de inventario ocurre **una sola vez**, al confirmar
  (`PENDING → CONFIRMED`): por cada ítem cuyo producto tiene
  `trackInventory = true` y una receta asociada, se registra un movimiento
  `SALE_CONSUMPTION` por cada ingrediente, escalado por
  `(cantidad_receta / rendimiento_receta) * cantidad_pedida`. Si se cancela
  un pedido que ya había consumido stock (`CONFIRMED`/`PREPARING`/`READY`),
  se revierte con movimientos `RETURN` equivalentes — nunca se edita ni
  borra el movimiento original, siguiendo la filosofía de ledger de
  Fase 4. Los ítems de un pedido solo pueden reemplazarse
  (`PUT /orders/:id/items`) mientras sigue en `PENDING`.
- **Cocina como vista restringida sobre Orders, no un módulo con estado
  propio.** `KitchenService` delega en `OrdersService.updateStatus()` y
  únicamente permite mover un pedido a `PREPARING` o `READY`
  (`UpdateKitchenStatusDto` valida el enum objetivo con `@IsIn`); el resto
  de la máquina de estados sigue centralizada en un solo lugar.
- **`cash_movements` registra solo lo que toca el efectivo físico de la
  caja.** Un pago `CASH` exige una sesión de caja abierta en la sede
  (`CashSessionClosedException` si no la hay) y genera un movimiento
  `SALE` con `payment_method = CASH`; pagos con tarjeta/transferencia/etc.
  actualizan el pedido pero no tocan la caja. `getExpectedClosingAmount()`
  calcula el efectivo esperado como
  `opening_amount + ventas en efectivo + INCOME − EXPENSE − WITHDRAWAL`
  (excluyendo explícitamente ventas no-CASH), y `difference_amount` es
  `actual_closing_amount − expected_closing_amount`. Solo puede haber una
  sesión `OPEN` por sede a la vez.
- **Pagos nunca exceden el total del pedido.** `PaymentsService` sólo
  acepta un pago si `pagado_hasta_ahora + monto ≤ total_amount`
  (`PAYMENT_EXCEEDS_ORDER_TOTAL`); no hay flujo de vueltas/cambio ni de
  reembolso en esta fase. `order.payment_status` se recalcula tras cada
  pago (`PENDING` → `PARTIALLY_PAID` → `PAID`).
- **Sin permisos nuevos para Clientes ni Mermas.** El catálogo de permisos
  ya estaba cerrado desde la Fase 1 (`orders.*`, `kitchen.*`, `cash.*`);
  Clientes reutiliza `orders.read`/`orders.create`/`orders.update` (se
  gestionan como parte del flujo de ventas) y Mermas reutiliza
  `inventory.adjust`/`inventory.read`, en vez de inventar códigos nuevos no
  contemplados en el diseño original.
- **`businesses.tax_rate` (Fase 6, migración 020)** es la tasa de impuesto
  del negocio, expresada como fracción (`0.19` = 19%), con
  `CHECK (tax_rate >= 0 AND tax_rate <= 1)`. Cierra un pendiente explícito
  de las Fases 4 y 5: tanto `PurchaseOrdersService` como `OrdersService`
  tenían un `TAX_RATE = 0` fijo en código con un comentario señalando que
  se corregiría cuando existiera esta configuración. Ahora ambos leen
  `BusinessesService.getTaxRate(businessId)` en el momento de calcular
  totales.
- **`/settings` es un recurso distinto de `/businesses/me`,** aunque los
  dos leen/escriben la misma fila de `businesses`. `businesses.manage`
  controla identidad (nombre, razón social, NIT, contacto);
  `settings.manage` controla configuración operativa (por ahora solo
  `tax_rate`). Mantenerlos separados respeta la intención original del
  catálogo de permisos, que ya distinguía ambos códigos desde la Fase 1.
- **`GET /audit-logs` expone por primera vez la auditoría que se viene
  grabando desde la Fase 1.** `AuditService.record()` nunca tuvo una
  contraparte de lectura; el endpoint (`settings.manage`, paginado,
  filtrable por `entityType`/`entityId`/`userId`/`action`/rango de fechas)
  no agrega escritura nueva, solo consulta `audit_logs` con el mismo
  scoping por `business_id` que el resto del sistema.
- **Dashboard y Analytics solo cuentan ventas `DELIVERED`.** Un pedido
  `PENDING`/`CONFIRMED`/`PREPARING`/`READY` todavía puede cambiar de monto
  (`PUT .../items`) o cancelarse, así que no es una venta real todavía.
  Todos los agregados de reportes (`getSalesSummary`, `getSalesByDay`,
  `getTopProducts` en `OrdersRepository`) filtran
  `status = 'DELIVERED'` y usan `delivered_at` — no `created_at` — como la
  fecha que importa, porque es el momento en que la venta efectivamente se
  completó. `getActiveCount` (pedidos en curso, para el dashboard) es la
  única excepción: cuenta el pipeline en vivo (`PENDING`/`CONFIRMED`/
  `PREPARING`/`READY`), sin filtro de fecha.
- **`top-products` agrupa por `product_name_snapshot`, no por una consulta
  en vivo a `products`.** Igual que el resto de `order_items`, así un
  producto renombrado o eliminado después de la venta no cambia ni rompe
  el reporte histórico.
- **`GET /dashboard/summary` acepta `branchId` opcional.** Sin él, agrega
  cifras de todo el negocio y `cashSessionOpen` queda en `null`
  (ambiguo con múltiples sedes — no `false`, que implicaría "todas
  cerradas"). Con `branchId`, sí resuelve el estado real de la caja de esa
  sede.
- **Sin permisos nuevos.** `dashboard.read` y `analytics.read` ya estaban
  en el catálogo desde la Fase 1, reservados exactamente para estos dos
  módulos.

## Requisitos

- Node.js ≥ 20 (probado con Node 24)
- PostgreSQL ≥ 14 (probado con PostgreSQL 17)
- npm

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` \| `provision` | `development` |
| `PORT` | Puerto HTTP | `3000` |
| `API_PREFIX` | Prefijo global de la API | `api/v1` |
| `CORS_ORIGIN` | Origen(es) permitido(s) para el frontend (`GB`); `*` o lista separada por comas. Usar `*` solo para pruebas rápidas sin credenciales — el SPA envía `credentials: true`, así que en cualquier entorno real debe ser un origen explícito, p. ej. `http://localhost:5173` en desarrollo | `http://localhost:5173` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `golden_bites` |
| `DB_USER` | Usuario de PostgreSQL | — |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `` |
| `DB_POOL_MAX` | Conexiones máximas del pool | `10` |
| `DB_IDLE_TIMEOUT_MS` | Timeout de conexión inactiva | `30000` |
| `DB_CONNECTION_TIMEOUT_MS` | Timeout de conexión | `5000` |
| `DB_SSL` | `true`/`false` | `false` |
| `JWT_ACCESS_SECRET` | Secreto del access token | — |
| `JWT_ACCESS_EXPIRES_IN` | Expiración del access token | `15m` |
| `JWT_REFRESH_SECRET` | Reservado para uso futuro (el refresh token actual es opaco, no JWT) | — |
| `JWT_REFRESH_EXPIRES_IN` | Vigencia del refresh token (formato `Nd`/`Nh`/`Nm`/`Ns`) | `7d` |

## Base de datos

### Levantar PostgreSQL localmente

Con Homebrew (macOS):

```bash
brew services start postgresql@17
```

O con Docker (ver sección Docker más abajo).

### Crear las bases de datos

```bash
createdb golden_bites
createdb golden_bites_test   # usada por las pruebas e2e/integración
```

### Ejecutar migraciones

```bash
npm run migration:run       # aplica las migraciones pendientes
npm run migration:status    # muestra qué está aplicado/pendiente y detecta cambios (checksum)
npm run migration:create -- nombre_de_la_migracion   # crea database/migrations/00X_nombre_de_la_migracion.sql
```

### Seeds

```bash
npm run seed
```

`npm run seed` es idempotente y hace cuatro cosas, en orden:
1. Ejecuta cualquier `.sql` en `database/seeds/` (vacío por ahora).
2. Inserta el catálogo completo de `permissions` (27 códigos) si faltan.
3. Si el negocio **"Golden Bites"** no existe, lo crea junto con su sede
   principal, sus 7 roles de sistema (con sus permisos por defecto) y un
   usuario `SUPER_ADMIN` de desarrollo — reutilizando los mismos servicios de
   Nest que expone la API (`BusinessesService`, `BranchesService`,
   `RolesService`, `UsersService`), no SQL duplicado. Si ya existe, se omite.
4. **Siempre** re-sincroniza los permisos de los 7 roles de sistema contra
   `DEFAULT_ROLE_PERMISSIONS` (aunque el negocio ya existiera) — así, cuando
   una fase nueva agrega códigos de permiso (p. ej. `inventory.manage`,
   `suppliers.manage` en la Fase 3), los roles ya provisionados los reciben
   sin tener que recrear el negocio. **Importante:** corre `npm run seed`
   tanto contra tu base de desarrollo como contra `golden_bites_test` después
   de un `git pull` que añada permisos nuevos (`DB_NAME=golden_bites_test
   npx ts-node -P tsconfig.json src/database/seed-runner.ts`), o los tests
   e2e fallarán con 403 en vez del código esperado.

> El script de seed corre con `ts-node` (no `tsx`): arranca un
> `NestApplicationContext` real para reutilizar los servicios de la app, y
> `tsx`/esbuild no emite metadata de decoradores (`design:paramtypes`), que
> es lo que usa la inyección de dependencias de NestJS para resolver
> constructores por tipo.

### Reset completo (solo desarrollo/test)

```bash
npm run db:reset            # DROP/CREATE del schema public + migraciones + seeds
```

`db:reset` se niega a ejecutarse si `NODE_ENV=production`.

## Desarrollo

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1` y la documentación
Swagger en `http://localhost:3000/api/docs`.

## Pruebas

```bash
npm test              # unitarias + integración de repositorios (junto al código fuente, *.spec.ts)
npm run test:watch    # modo watch
npm run test:cov      # con reporte de cobertura y gate mínimo (70/60/70/70)
npm run test:e2e      # end-to-end contra golden_bites_test (requiere DB real + migraciones + seed aplicados)
```

`npm test` incluye pruebas de integración de repositorios (`*.repository.spec.ts`
en `branches`, `users`, `product-categories`, `products`, `suppliers`,
`inventory-items`, `recipes`, `inventory-locations`, `inventory-movements`,
`inventory-transfers`, `inventory-counts`, `purchases`, `goods-receipts`,
`customers`, `cash-sessions`, `orders`, `payments`, `waste`, `businesses` y
`audit`) que golpean **golden_bites_test** directamente (sin mocks, como
pide la convención del proyecto) y limpian sus propios datos en `afterAll`.
Asegúrate de tener esa base creada, migrada y sembrada antes de correr los
tests (ver "Base de datos" arriba).

Los tests e2e usan el usuario admin sembrado por `npm run seed`
(`admin@goldenbites.local`); ejecuta migraciones + seed sobre
`golden_bites_test` antes de la primera corrida:

```bash
DB_NAME=golden_bites_test npx tsx src/database/reset-database.ts
```

## Docker

```bash
docker compose up --build
```

Levanta `backend`, `postgres` y `redis` (Redis queda disponible para caché o
colas futuras pero no es requerido para que el backend arranque). El backend
espera a que Postgres pase su healthcheck antes de iniciar. Ejecuta las
migraciones manualmente contra el contenedor cuando lo necesites:

```bash
docker compose exec backend node dist/database/migration-runner.js
```

## Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | Pública | Estado general del servicio y la BD |
| GET | `/api/v1/health/ready` | Pública | Readiness probe (503 si la BD no responde) |
| GET | `/api/v1/health/live` | Pública | Liveness probe |
| POST | `/api/v1/auth/login` | Pública | Login con email + password |
| POST | `/api/v1/auth/refresh` | Pública | Rota el refresh token, emite un nuevo par |
| POST | `/api/v1/auth/logout` | Pública | Revoca un refresh token |
| POST | `/api/v1/auth/change-password` | JWT | Cambia la contraseña del usuario autenticado |
| POST | `/api/v1/auth/forgot-password` | Pública | Genera un token de reseteo (respuesta genérica siempre) |
| POST | `/api/v1/auth/reset-password` | Pública | Aplica un nuevo password usando el token |
| POST | `/api/v1/businesses` | `@Roles('SUPER_ADMIN')` | Aprovisiona un negocio nuevo + sus roles de sistema |
| GET/PATCH | `/api/v1/businesses/me` | JWT / `businesses.manage` | Negocio del usuario actual |
| PATCH | `/api/v1/businesses/me/status` | `businesses.manage` | Activar/desactivar el negocio |
| POST/GET | `/api/v1/branches` | `branches.manage` / JWT | Crear / listar sedes del negocio actual |
| GET/PATCH | `/api/v1/branches/:id` | JWT / `branches.manage` | Detalle / edición de una sede |
| PATCH | `/api/v1/branches/:id/status` | `branches.manage` | Activar/desactivar sede |
| GET | `/api/v1/permissions` | `roles.manage` | Catálogo completo de permisos |
| POST/GET | `/api/v1/roles` | `roles.manage` | Crear / listar roles del negocio actual |
| GET/PATCH | `/api/v1/roles/:id` | `roles.manage` | Detalle / edición de un rol |
| PUT | `/api/v1/roles/:id/permissions` | `roles.manage` | Reemplaza el set de permisos de un rol |
| POST/GET | `/api/v1/users` | `users.manage` | Crear / listar usuarios del negocio actual |
| GET | `/api/v1/users/me` | JWT | Perfil propio |
| GET/PATCH | `/api/v1/users/:id` | `users.manage` | Detalle / edición de un usuario |
| PATCH | `/api/v1/users/:id/status` | `users.manage` | ACTIVE / INACTIVE / BLOCKED |
| DELETE | `/api/v1/users/:id` | `users.manage` | Soft delete |
| POST/GET | `/api/v1/product-categories` | `products.create`/`products.read` | Crear / listar categorías |
| GET/PATCH | `/api/v1/product-categories/:id` | `products.read`/`products.update` | Detalle / edición |
| PATCH | `/api/v1/product-categories/:id/status` | `products.update` | Activar/desactivar categoría |
| POST/GET | `/api/v1/products` | `products.create`/`products.read` | Crear / listar productos |
| GET | `/api/v1/products/available` | `products.read` | Productos activos disponibles para venta |
| GET/PATCH | `/api/v1/products/:id` | `products.read`/`products.update` | Detalle / edición |
| GET | `/api/v1/products/:id/margin` | `products.read` | Margen (precio - costo) |
| PATCH | `/api/v1/products/:id/status` | `products.update` | Activar/desactivar |
| DELETE | `/api/v1/products/:id` | `products.update` | Soft delete |
| POST/GET | `/api/v1/products/:productId/recipe` | `products.update`/`products.read` | Crear / consultar receta (con costo) |
| PATCH | `/api/v1/products/:productId/recipe` | `products.update` | Editar nombre/rendimiento/instrucciones |
| PUT | `/api/v1/products/:productId/recipe/items` | `products.update` | Reemplazar ingredientes (resincroniza el costo) |
| DELETE | `/api/v1/products/:productId/recipe` | `products.update` | Eliminar receta |
| POST/GET | `/api/v1/suppliers` | `suppliers.manage`/`suppliers.read` | Crear / listar proveedores |
| GET/PATCH | `/api/v1/suppliers/:id` | `suppliers.read`/`suppliers.manage` | Detalle / edición |
| PATCH | `/api/v1/suppliers/:id/status` | `suppliers.manage` | Activar/desactivar |
| POST/GET | `/api/v1/inventory-items` | `inventory.manage`/`inventory.read` | Crear / listar insumos |
| GET/PATCH | `/api/v1/inventory-items/:id` | `inventory.read`/`inventory.manage` | Detalle / edición |
| PATCH | `/api/v1/inventory-items/:id/status` | `inventory.manage` | Activar/desactivar |
| DELETE | `/api/v1/inventory-items/:id` | `inventory.manage` | Soft delete |
| POST/GET | `/api/v1/branches/:branchId/inventory-locations` | `inventory.manage`/`inventory.read` | Crear / listar ubicaciones de una sede |
| GET/PATCH | `/api/v1/branches/:branchId/inventory-locations/:id` | `inventory.read`/`inventory.manage` | Detalle / edición |
| PATCH | `/api/v1/branches/:branchId/inventory-locations/:id/status` | `inventory.manage` | Activar/desactivar |
| GET | `/api/v1/inventory/stock` | `inventory.read` | Stock actual (derivado del ledger de movimientos) |
| GET | `/api/v1/inventory/low-stock` | `inventory.read` | Insumos por debajo de su stock mínimo |
| GET | `/api/v1/inventory/movements` | `inventory.read` | Kardex, filtrable y paginado |
| POST | `/api/v1/inventory/adjustments` | `inventory.adjust` | Ajuste manual de stock (IN/OUT) con motivo |
| POST/GET | `/api/v1/inventory/transfers` | `inventory.transfer`/`inventory.read` | Solicitar / listar traslados |
| GET | `/api/v1/inventory/transfers/:id` | `inventory.read` | Detalle con ítems |
| POST | `/api/v1/inventory/transfers/:id/complete` | `inventory.transfer` | Completa el traslado (TRANSFER_OUT + TRANSFER_IN) |
| POST | `/api/v1/inventory/transfers/:id/cancel` | `inventory.transfer` | Cancela un traslado pendiente |
| POST/GET | `/api/v1/inventory/counts` | `inventory.count`/`inventory.read` | Iniciar / listar conteos físicos |
| GET | `/api/v1/inventory/counts/:id` | `inventory.read` | Detalle con cantidades esperadas/contadas |
| PUT | `/api/v1/inventory/counts/:id/items` | `inventory.count` | Registra la cantidad contada de un ítem |
| POST | `/api/v1/inventory/counts/:id/complete` | `inventory.count` | Cierra el conteo, genera ajustes por diferencia |
| POST | `/api/v1/inventory/counts/:id/cancel` | `inventory.count` | Cancela un conteo en progreso |
| POST/GET | `/api/v1/purchase-orders` | `purchases.create`/`purchases.read` | Crear / listar órdenes de compra |
| GET | `/api/v1/purchase-orders/:id` | `purchases.read` | Detalle con ítems y cantidades recibidas |
| POST | `/api/v1/purchase-orders/:id/submit` | `purchases.create` | DRAFT → SUBMITTED |
| POST | `/api/v1/purchase-orders/:id/approve` | `purchases.approve` | SUBMITTED → APPROVED |
| POST | `/api/v1/purchase-orders/:id/cancel` | `purchases.cancel` | Cancela (si no tiene recepciones ya registradas) |
| POST/GET | `/api/v1/goods-receipts` | `purchases.receive`/`purchases.read` | Recibir mercancía (total/parcial) / listar recepciones |
| GET | `/api/v1/goods-receipts/:id` | `purchases.read` | Detalle con ítems recibidos |
| POST/GET | `/api/v1/customers` | `orders.create`/`orders.read` | Crear / listar clientes (buscable por nombre/teléfono/email) |
| GET/PATCH | `/api/v1/customers/:id` | `orders.read`/`orders.update` | Detalle / edición |
| DELETE | `/api/v1/customers/:id` | `orders.update` | Soft delete |
| POST/GET | `/api/v1/customers/:id/addresses` | `orders.update`/`orders.read` | Agregar / listar direcciones guardadas |
| DELETE | `/api/v1/customers/:id/addresses/:addressId` | `orders.update` | Eliminar una dirección guardada |
| POST/GET | `/api/v1/cash-sessions` | `cash.open` | Abrir caja / listar sesiones |
| GET | `/api/v1/cash-sessions/current` | `cash.open` | Sesión abierta actual de una sede |
| GET | `/api/v1/cash-sessions/:id` | `cash.open` | Detalle con movimientos |
| POST | `/api/v1/cash-sessions/:id/movements` | `cash.withdraw` | Movimiento manual (INCOME/EXPENSE/WITHDRAWAL) |
| POST | `/api/v1/cash-sessions/:id/close` | `cash.close` | Cierra la caja y calcula la diferencia |
| POST/GET | `/api/v1/orders` | `orders.create`/`orders.read` | Crear pedido (PENDING) / listar |
| GET | `/api/v1/orders/:id` | `orders.read` | Detalle con ítems |
| PUT | `/api/v1/orders/:id/items` | `orders.update` | Reemplaza ítems (solo si sigue en PENDING) |
| PATCH | `/api/v1/orders/:id/status` | `orders.update` | Transición de estado (consume/revierte stock) |
| GET | `/api/v1/kitchen/orders` | `kitchen.read` | Cola de pedidos CONFIRMED/PREPARING |
| PATCH | `/api/v1/kitchen/orders/:id/status` | `kitchen.update_status` | Marca PREPARING o READY |
| POST/GET | `/api/v1/orders/:orderId/payments` | `orders.update`/`orders.read` | Registrar / listar pagos de un pedido |
| POST/GET | `/api/v1/waste` | `inventory.adjust`/`inventory.read` | Registrar merma (genera movimiento WASTE) / listar |
| GET/PATCH | `/api/v1/settings` | `settings.manage` | Configuración operativa del negocio (tax_rate) |
| GET | `/api/v1/audit-logs` | `settings.manage` | Consulta el rastro de auditoría, paginado y filtrable |
| GET | `/api/v1/dashboard/summary` | `dashboard.read` | Ventas de hoy, pedidos activos, stock bajo, estado de caja |
| GET | `/api/v1/analytics/sales` | `analytics.read` | Ventas completadas agrupadas por día en un rango de fechas |
| GET | `/api/v1/analytics/top-products` | `analytics.read` | Productos más vendidos por ingreso en un rango de fechas |
| * | `/api/docs` | — | Swagger UI |

## Convenciones

- Prefijo de API: `/api/v1`.
- Toda respuesta exitosa se envuelve como
  `{ success, data, meta, timestamp }`, salvo endpoints marcados con
  `@RawResponse()`.
- Todo error sigue el formato:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Descripción del error",
    "code": "ORDER_INVALID_STATUS",
    "details": {},
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/api/v1/orders"
  }
  ```
- Nunca se concatenan valores en SQL; todo query usa parámetros (`$1, $2...`).
- `business_id` / `branch_id` nunca se aceptan desde el body — se derivan del
  usuario autenticado vía `@CurrentBusiness()` / `@CurrentBranch()`.
- Todo endpoint protegido requiere `Authorization: Bearer <accessToken>`.
  Usa `@Public()` para las excepciones explícitas (login, health, etc.).

## Comandos disponibles

```bash
npm run start            # producción, sin watch
npm run start:dev        # desarrollo con watch
npm run start:debug      # desarrollo con debugger
npm run start:prod       # ejecuta dist/main.js
npm run build             # compila a dist/
npm run lint               # ESLint con --fix
npm run format              # Prettier
npm test                     # pruebas unitarias + integración de repositorios
npm run test:watch
npm run test:cov
npm run test:e2e
npm run migration:run
npm run migration:status
npm run migration:create -- <nombre>
npm run seed
npm run db:reset
```

## Credenciales iniciales

Creadas por `npm run seed`:

```
email: admin@goldenbites.local
password: ChangeMe123!
```

Rol: `SUPER_ADMIN` del negocio "Golden Bites".

**Esta contraseña debe cambiarse (`POST /auth/change-password`) antes de usar
el sistema en un entorno real.**
