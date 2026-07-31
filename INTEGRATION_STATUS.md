# Golden Bites — Estado de integración Frontend ↔ Backend

_Última actualización: 2026-07-29 (fase 3: Personal, Checklists, Mantenimiento, Fidelización, Marketing, Documentos y Finanzas — backend nuevo + integración completa; fase 4: eliminación de toda la data mock restante en el frontend, incluyendo `AnalyticsPage.tsx`)_

## Resumen

- Frontend: `GB` (React 19 + TS + Vite + MUI + Zustand + React Query + React Router)
- Backend: `GB-BE` (NestJS 11 + `pg` directo, sin ORM), prefijo global `api/v1`, Swagger en `/api/docs`
- Formato de respuesta real: `{ success, data, meta?, timestamp }`
- Formato de error real: `{ statusCode, error, message, code, details, timestamp, path }`
- Autenticación: JWT access token (Bearer) + refresh token devuelto en JSON (no cookie httpOnly todavía)

## Módulos

| Módulo | Frontend | Endpoint backend | Estado |
|---|---|---|---|
| Health | Indicador de conexión (dev) | `GET /health`, `/health/ready`, `/health/live` | Integrado |
| Auth | Login, refresh, logout, usuario actual | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /users/me` | Integrado |
| Products | CRUD, activar/desactivar | `GET/POST/PATCH/DELETE /products`, `/products/:id/status` | Integrado — UI simplificada a campos reales |
| Product Categories | Selector/filtro en Products, chips en Settings | `GET/POST/PATCH /product-categories`, `/status` | Integrado (lectura + creación); sin pantalla de gestión dedicada (el frontend nunca tuvo una) |
| Customers | CRUD, notas, direcciones | `GET/POST/PATCH/DELETE /customers`, `/:id/addresses` | Integrado — UI simplificada (sin segmento/favoritos/historial ficticios) |
| Suppliers | CRUD, activar/desactivar | `GET/POST/PATCH /suppliers`, `/status` | Integrado — UI simplificada (sin rating/condiciones de pago ficticios) |
| Orders | Kanban + tabla, crear, avanzar estado, cancelar, pagos | `GET/POST /orders`, `/:id`, `/:id/status`, `PUT /:id/items`, `/orders/:id/payments` | Integrado — pipeline real (6 estados) reemplaza el ficticio de 8 |
| Kitchen | Cola de cocina, iniciar preparación, marcar listo | `GET /kitchen/orders`, `PATCH /kitchen/orders/:id/status` | Integrado — se quitó el checklist por ítem y la estación de trabajo (no existen en backend) |
| Cash Sessions | Apertura/cierre de caja, movimientos manuales | `GET/POST /cash-sessions`, `/current`, `/:id/close`, `/:id/movements` | Integrado — sin preview en vivo del efectivo esperado (el backend solo lo calcula al cerrar) |
| Inventory | Catálogo de insumos, stock, ajustes, kardex | `GET/POST/PATCH /inventory-items`, `/inventory/stock`, `/low-stock`, `/movements`, `POST /inventory/adjustments` | Integrado (items + stock + ajustes + kardex) |
| Inventory Locations / Transfers / Counts | — | `inventory-locations`, `inventory-transfers`, `inventory-counts` | **Pendiente**: el frontend nunca tuvo pantallas para esto (modelo de insumo de una sola ubicación); requiere UI nueva, fuera de alcance de esta entrega |
| Purchases | Sugerencia de compra (desde stock bajo real), crear/enviar/aprobar/cancelar orden | `GET/POST /purchase-orders`, `/submit`, `/approve`, `/cancel` | Integrado |
| Goods Receipts | Recepción de mercancía (parcial o total) | `POST /goods-receipts` | Integrado |
| Waste | Registro de mermas | `GET/POST /waste` | Integrado — motivo pasó de enum fijo a texto libre (con opciones sugeridas) |
| Dashboard | KPIs del día, ventas 7 días, top productos, alertas, snapshot de cocina | `GET /dashboard/summary`, `/analytics/sales`, `/analytics/top-products`, `/kitchen/orders` | Integrado — se quitaron ventas por hora, canal, margen/utilidad estimados y tiempo de preparación (no existen en backend) |
| Analytics | Ventas últimos 7 días, productos más vendidos, ventas por categoría (hoy), margen por producto, rotación de inventario, mermas por motivo, pedidos cancelados, descuentos de hoy, clientes frecuentes | `GET /analytics/sales`, `/analytics/top-products`, `/orders`, `/orders/:id`, `/products`, `/product-categories`, `/inventory/movements`, `/waste`, `/customers` | **Integrado por completo (fase 4)** — ver decisión 24 (reemplaza el hallazgo de la fase 3, ya resuelto) |
| Settings | Info del negocio, sedes (lectura), impuesto, categorías reales, estados de pedido reales | `GET/PATCH /businesses/me`, `GET /branches`, `GET/PATCH /settings` | Integrado parcialmente: métodos de pago/canales habilitados y la matriz rol→módulo siguen siendo preferencias locales (sin modelo en backend) |
| Employees | CRUD de empleados, horario semanal recurrente | `GET/POST/PATCH/DELETE /employees`, `/:id/status`, `PUT /:id/shifts` | Integrado — módulo backend nuevo |
| Checklists | Plantillas (apertura/cierre) con ítems, ejecuciones con snapshot de ítems y estado calculado | `GET/POST/PATCH/DELETE /checklist-templates`, `/:id/items`, `/:id/status`; `GET/POST /checklist-runs`, `/:id/items`, `/:id/complete` | Integrado — módulo backend nuevo. `COMPLETED` vs `INCOMPLETE` se calcula en el backend (todos los ítems marcados o no) |
| Maintenance | Equipos + historial de intervenciones (append-only) | `GET/POST/PATCH/DELETE /equipment`, `/:id/status`, `POST /:id/interventions`, `DELETE /:id/interventions/:interventionId` | Integrado — módulo backend nuevo |
| Loyalty | Configuración del programa, catálogo de recompensas, canje, historial de movimientos | `GET/PATCH /loyalty/config`, `GET/POST/PATCH/DELETE /loyalty-rewards`, `/:id/status`, `GET /loyalty/movements`, `POST /loyalty/redemptions` | Integrado — módulo backend nuevo. **Activa la columna `customers.loyalty_points`** (existía pero nunca se usaba): al entregar un pedido (`OrdersService`, estado `DELIVERED`) se otorgan puntos automáticamente según `businesses.loyalty_points_per_thousand`, verificado end-to-end con un pedido real |
| Marketing | Campañas (con métricas manuales), cupones, calendario de contenido, influencers | `GET/POST/PATCH/DELETE /marketing-campaigns`, `/marketing-coupons` (+`/status`), `/marketing-content-items`, `/marketing-influencers` | Integrado — módulo backend nuevo. Métricas de campaña (alcance, clics, conversiones, invertido) y uso de cupón son de entrada manual — no hay integración con plataformas publicitarias reales |
| Documents | Registro de documentos de cumplimiento (legal/sanitario/seguridad) | `GET/POST/PATCH/DELETE /compliance-documents` | Integrado — módulo backend nuevo. **Solo metadata**: `fileName` es un campo de texto libre de referencia; este backend no tiene almacenamiento de archivos, no se sube ni se sirve ningún binario. El estado (vigente/por vencer/vencido) se sigue calculando en el frontend a partir de `expirationDate`, igual que en el mock |
| Finances | Gastos categorizados (COGS/operativos/nómina/marketing/otros) + P&L combinando gastos reales con ventas reales | `GET/POST/PATCH/DELETE /expenses`, `GET /expenses/summary` | Integrado — módulo backend nuevo. Los ingresos del P&L usan `GET /analytics/sales` (ya real) agregado por mes en el cliente; se eliminó el "punto de equilibrio en combos" del mock (lógica específica de nombre de producto que no generaliza) |

## Decisiones y desviaciones documentadas

1. **CORS**: se usa la variable ya existente `CORS_ORIGIN` (backend) en vez de introducir `FRONTEND_URL`, porque `main.ts` ya soporta múltiples orígenes separados por coma y `credentials: true`.
2. **Refresh token en JSON**: el backend no usa cookie httpOnly (lo devuelve en el body de `/auth/login` y `/auth/refresh`). Aislado en `src/lib/api/token-storage.ts`; migrar a cookie httpOnly es un pendiente del backend.
3. **`GET /auth/me` no existe**: se usa `GET /users/me`.
4. **Simulador de rol eliminado**: reemplazado por la sesión real (JWT). `usePermissions` real (JWT decodificado) gatea acciones finas (crear/editar/eliminar) en todos los módulos integrados vía `<Can permission="...">`. *(Actualizado en fase 3: los 7 módulos que faltaban — loyalty, finances, employees, checklists, maintenance, documents, marketing — ya tienen su propio módulo/permiso backend `<módulo>.read`/`<módulo>.manage` [+ `checklists.execute`, `loyalty.redeem`], así que el catálogo de permisos ahora sí cubre 1:1 los 19 módulos de navegación.)*
5. **Permisos vía JWT decodificado**: no hay endpoint "mis permisos" alcanzable por un usuario normal (`GET /permissions` y `GET /roles/:id` requieren `roles.manage`). `src/modules/auth/hooks/use-permissions.ts` decodifica el payload del JWT (sin verificar firma, solo para UI). La aplicación real sigue en el backend vía `PermissionsGuard`.
6. **Products — mismatch de contrato**: se preguntó al usuario; eligió simplificar la UI a los campos reales (`name, categoryId, description, sku, salePrice, currentCost, isActive, trackInventory`), quitando emoji/receta/modificadores/tiempo de preparación (el costeo por receta vive en el módulo `recipes`, no integrado).
7. **Patrón "no tocar los mocks de otros módulos"**: en cada integración, cuando el store/tipo ficticio original (`store/*.ts`, `features/*/types.ts`, `*Mock.ts`) seguía siendo usado por un módulo **todavía no integrado**, se dejó intacto y solo se crearon módulos nuevos en `src/modules/<dominio>/`. Los componentes de UI (páginas/drawers) se reescribieron únicamente cuando eran privados de su propia feature. **Con la fase 3 (Employees, Checklists, Maintenance, Loyalty, Marketing, Documents, Finances) los 7 módulos que quedaban en mock ya están completamente integrados** — no queda ningún módulo de navegación sin backend real.
8. **`src/store/authStore.ts` (mock antiguo, distinto de `modules/auth/store/auth.store.ts` real)**: confirmado sin referencias en toda la fase 3 → **eliminado**, junto con otros 3 stores mock huérfanos que ya no tenía ninguna pantalla real (`suppliersStore.ts`, `cashRegisterStore.ts`, `purchasesStore.ts` — quedaron sin uso tras integraciones de fases anteriores y nunca se limpiaron). `store/index.ts` actualizado.
9. **Orders — pipeline simplificado**: el backend modela `PENDING → CONFIRMED → PREPARING → READY → DELIVERED` (+ `CANCELLED`), más simple que el ficticio de 8 estados (sin "empacando/en camino/listo para recoger" separados). `orderType` (`DINE_IN/TAKEAWAY/DELIVERY`) reemplaza el concepto de "canal" (WhatsApp/Rappi/etc., que no existe en backend). El historial de cambios de estado no se expone por API (se guarda en BD pero no hay endpoint `GET`) — se documenta como pendiente.
10. **Pagos**: `POST /orders/:orderId/payments` registra pagos parciales; el saldo pendiente se calcula en el cliente sumando pagos. Solo los pagos en efectivo (`CASH`) generan un movimiento en la sesión de caja abierta — los demás métodos no tocan el ledger de caja (arquitectura correcta: solo el efectivo físico requiere arqueo).
11. **Kitchen**: sin checklist por ítem ni "estaciones" (freidora/empaque/etc., basadas en categorías ficticias fijas) — el backend solo permite transicionar a `PREPARING`/`READY`. La cola (`GET /kitchen/orders`) no incluye ítems; se usa `GET /orders/:id` por tarjeta para mostrarlos (aceptable para una cola pequeña).
12. **Cash Sessions**: `expectedClosingAmount` solo lo calcula el backend al cerrar (`POST /:id/close`), no hay endpoint de "preview" mientras la caja está abierta — se quitó el cálculo/preview en vivo del formulario de cierre; la diferencia se muestra después de confirmar.
13. **Purchases**: no existe relación proveedor↔insumo en el backend (a diferencia del mock, que tenía `primarySupplierId` por insumo), así que la "sugerencia de compra" ahora lista insumos con stock bajo (dato real) pero el usuario elige manualmente un único proveedor por orden (una orden = un proveedor, como exige `CreatePurchaseOrderDto`).
14. **Waste**: `reason` es texto libre en el backend (no un enum fijo); se conserva la lista de motivos sugeridos del mock como opciones de un select, pero el valor enviado es simplemente el string elegido.
15. **Settings**: `taxRate` se edita vía `PATCH /settings` (no vía `PATCH /businesses/me`, que no lo acepta). Sedes son de solo lectura (no había formulario de creación/edición en el mock original). Se quitó "horarios de atención" (no existe en backend).
16. **Analytics/Dashboard**: sin endpoints de ventas por hora, por canal, margen por producto, uso de salsas, rotación de inventario, mermas por motivo o clientes frecuentes — esas secciones de `AnalyticsPage` siguen en mock; solo "ventas 7 días" y "productos más vendidos" son reales.
17. **Employees — turnos**: `PUT /:id/shifts` reemplaza el horario semanal completo (patrón "reemplazar sub-colección", igual que ítems de orden/receta/checklist). `day_of_week` seed usa `EXTRACT(DOW)` de Postgres (0=domingo).
18. **Checklists**: al iniciar una ejecución (`POST /checklist-runs`), el backend copia (`snapshot`) los ítems de la plantilla en ese momento — si la plantilla cambia después, las ejecuciones históricas no se alteran. `complete()` calcula `COMPLETED` vs `INCOMPLETE` comparando si todos los ítems quedaron marcados; verificado con un caso real (1 de 2 ítems marcado → `INCOMPLETE`).
19. **Maintenance — intervenciones**: historial de tipo "append-only" (crear + listar + soft-delete individual), sin edición — igual patrón que `waste`. No existe relación equipo↔proveedor en el backend (a diferencia del mock, que tenía `technicalSupplier` como referencia libre de texto, que se conservó tal cual).
20. **Loyalty — puntos automáticos**: se agregaron 3 columnas a `businesses` (`loyalty_points_per_thousand`, `loyalty_birthday_bonus_enabled`, `loyalty_birthday_bonus_points`, todas con default) siguiendo el mismo patrón que `tax_rate`. `OrdersService.updateStatus()` ahora también llama a `LoyaltyService.awardPointsForOrder()` en la rama `DELIVERED` (antes solo llamaba a `CustomersService.recordCompletedOrder()`); esto se probó con cuidado para no romper `orders.service.spec.ts` (se agregó el mock `loyaltyService` al constructor sin cambiar los argumentos de las llamadas ya verificadas). La promoción de cumpleaños (`birthdayBonus*`) solo expone la configuración — no hay job/cron que la dispare automáticamente (quedaría para una fase futura si se requiere).
21. **Marketing**: 4 sub-recursos independientes (campañas, cupones, calendario de contenido, influencers) comparten los permisos `marketing.read`/`marketing.manage`. Las métricas de campaña (alcance, clics, conversiones, invertido) y el conteo de uso de cupón son editables manualmente — no hay integración con Meta Ads/Google/etc.
22. **Documents**: sin almacenamiento de archivos en este backend. `fileName` es únicamente una etiqueta de texto para referencia humana ("dónde está guardado físicamente/en Drive"); se documentó explícitamente en el DTO y en el formulario del frontend para no sugerir que el archivo se sube de verdad.
23. **Finances**: el P&L combina gastos reales (tabla nueva `expenses`, categorizada) con ingresos reales de `GET /analytics/sales` (ya existente, agregado por mes en el cliente). Se eliminó el "punto de equilibrio en combos vendidos" del mock original porque dependía de buscar la palabra "combo" en el nombre del producto — lógica frágil que no generaliza a catálogos reales.
24. **Fase 4 — `AnalyticsPage.tsx` reescrita por completo con datos reales** (resuelve el hallazgo que quedó documentado al final de la fase 3): se reemplazaron `store/ordersStore.ts`, `store/productsStore.ts`, `store/inventoryStore.ts`, `store/wasteStore.ts` y `features/customers/mocks/customersMock.ts` por los módulos reales ya existentes (`modules/orders`, `modules/products`, `modules/product-categories`, `modules/inventory`, `modules/waste`, `modules/customers`):
    - **Ventas por categoría (hoy)**: como el listado de pedidos no incluye ítems, se obtienen los pedidos de hoy (`GET /orders?dateFrom&dateTo`) y luego se pide el detalle de cada uno en paralelo (`useQueries`, mismo patrón que `ShiftCalendar`) para sumar por `categoryId` real del producto — acotado a un solo día, así que el número de peticiones es pequeño.
    - **Margen por producto**: ya no depende de receta/insumo ficticios — el `Product` real ya trae `salePrice`/`currentCost`, así que el margen se calcula directo (`(salePrice - currentCost) / salePrice`), sin necesidad de "costeo por receta".
    - **Rotación de inventario**: cuenta real de `GET /inventory/movements` por `inventoryItemId`, con nombres desde `GET /inventory-items`.
    - **Mermas por motivo**: `GET /waste` real, agrupado por el `reason` de texto libre (sin la lista fija de motivos del mock).
    - **Pedidos cancelados (histórico)**: `GET /orders?status=CANCELLED` usando `meta.total` (no el tamaño de una página).
    - **Descuentos aplicados hoy**: suma de `discountAmount` de los pedidos reales de hoy.
    - **Clientes frecuentes**: `GET /customers` ordenado por `totalOrders` real. Se **eliminó el concepto de "cliente VIP"** (no existe un campo `segment` en el backend ni en el mock que tuviera sentido preservar) y se reemplazó por un conteo honesto de "clientes con 3+ pedidos".
    - **Eliminado sin reemplazo**: "Uso de salsas" — dependía enteramente de `product.recipe` e inventario categorizado como `'salsas'`, ninguno de los cuales existe en el backend real (el módulo `recipes` sigue sin integrar, ver sección de módulos backend sin integrar). No se inventó un sustituto.
25. **Fase 4 — limpieza de código muerto en todo el frontend** (no solo los 7 módulos de la fase 3): al buscar exhaustivamente cualquier referencia mock restante se encontraron y eliminaron archivos húerfanos dejados por integraciones de fases anteriores que ya no los usaba ninguna pantalla real: `store/{orders,products,inventory,waste,authStore-viejo,suppliers,cashRegister,purchases}Store.ts`, `features/{orders,products,inventory,customers,purchases,suppliers,employees,cash-register}/{types.ts,mocks/}`, `features/dashboard/{utils.ts,mocks/salesHistoryMock.ts,components/ChannelDistributionChart.tsx}`, `features/products/utils.ts`, `features/cash-register/utils.ts`, `features/inventory/utils.ts`. También se recortaron `features/orders/utils.ts` (quedó solo con `getElapsedMinutes`/`ORDER_SLA_MINUTES`, que sí usa `OrderTimer.tsx`; el resto dependía del `Order` ficticio y ya tiene su equivalente real en `modules/orders/order-status.ts`), `features/waste/types.ts` (se quitó la interfaz `WasteEntry` muerta, se conservó `WASTE_REASON_LABELS` que sí usa `WasteFormDrawer.tsx`) y `types/common.ts` (se quitaron `MeasurementUnit`, `Address`, `EntityStatus`, `DateRangePreset`, sin ningún uso real). En cada caso se verificó con `grep` que no había ningún componente real importándolos antes de borrar, y se corrió `typecheck`/`lint`/`build` después de cada tanda para atrapar importaciones rotas.
26. **Excepción documentada, no eliminada — preferencias locales en Configuración**: `store/settingsStore.ts` sigue existiendo para `paymentMethodsEnabled`/`channelsEnabled` (chips activables en la pestaña "Impuestos, pagos y canales de venta" de Configuración). A diferencia de todo lo demás en esta lista, esto **no es un registro de negocio ficticio** — es una preferencia de interfaz sin modelo en el backend, y la propia pantalla ya lo advierte explícitamente ("preferencias locales de la interfaz — el backend no modela esta configuración todavía"). Se recortó el store para quitar los campos que sí eran ficticios y ya no se leían en ningún lado (`businessInfo` con nombre/NIT/dirección falsos, `sedes`, `schedule`, `taxRatePercent`, `lowStockThresholdPercent` — el negocio, las sedes y el impuesto reales ya se muestran vía `modules/businesses`/`modules/branches`/`modules/settings`). Si se quiere eliminar también esta preferencia local, requeriría agregar columnas nuevas al backend (`businesses.enabled_payment_methods`, `businesses.enabled_channels` o similar) — no se hizo porque ningún otro componente de la app lee estos valores para cambiar comportamiento real (son toggles cosméticos).

## Variables de entorno

### Frontend (`GB/.env.development`, ver `.env.example`)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Backend (`GB-BE/.env`, ver `.env.example`)
```
CORS_ORIGIN=http://localhost:5173
```

## Comandos para levantar el entorno local

1. PostgreSQL corriendo en `localhost:5432`.
2. Backend:
   ```
   cd GB-BE
   npm install
   npm run migration:run
   npm run seed
   npm run start:dev
   ```
3. Frontend:
   ```
   cd GB
   npm install
   npm run dev
   ```
4. Abrir `http://localhost:5173`, iniciar sesión con un usuario sembrado por `npm run seed`.

Swagger: `http://localhost:3000/api/docs`
API: `http://localhost:3000/api/v1`

Credenciales sembradas por `npm run seed` (rol `SUPER_ADMIN`):
```
email: admin@goldenbites.local
password: ChangeMe123!
```

## Resultado de verificación (fase 3: Employees, Checklists, Maintenance, Loyalty, Marketing, Documents, Finances)

| Chequeo | Resultado |
|---|---|
| Frontend `npm run typecheck` | ✅ OK |
| Frontend `npm run lint` | ✅ OK |
| Frontend `npm run build` | ✅ OK |
| Backend `npm run build` | ✅ OK |
| Backend `npm run lint` | ✅ OK |
| Backend `npm test` (unitarias) | ✅ 468/468 pasan (91 suites) — incluye los tests existentes de `orders`/`customers`/`businesses` re-verificados tras tocarlos para Loyalty |
| Backend `npm run test:e2e` | ⚠️ (heredado, sin cambios en esta fase) 5 fallos preexistentes en `sales-flow.e2e-spec.ts`, no relacionados |

## Resultado de verificación (fase 4: eliminación de mocks restantes en todo el frontend)

| Chequeo | Resultado |
|---|---|
| Frontend `npm run typecheck` | ✅ OK (tras arreglar 2 importaciones rotas encontradas al eliminar `features/{orders,inventory}/types.ts`) |
| Frontend `npm run lint` | ✅ OK |
| Frontend `npm run build` | ✅ OK |
| Verificación visual (Playwright headless, las 19 páginas de navegación) | ✅ 19/19 cargan sin errores de consola ni de red (el único HTTP 404 observado, en Caja, es esperado y ya manejado: significa "no hay turno de caja abierto") |
| Verificación visual detallada (captura de pantalla completa) | ✅ `AnalyticsPage.tsx` — todos los gráficos muestran datos reales o estados vacíos honestos ("Sin mermas registradas", "Sin clientes registrados"), ninguno muestra información ficticia |
| Verificación manual por curl (los 7 módulos nuevos) | ✅ CRUD completo probado end-to-end para cada uno (crear→listar→actualizar→estado/canje→eliminar), incluyendo el flujo real orden entregada → puntos de fidelización otorgados |
| Verificación visual (Playwright headless, las 7 páginas nuevas) | ✅ Sin errores de consola ni de red tras login real |

Migraciones nuevas de esta fase: `021_create_employee_tables.sql` … `027_create_expenses_table.sql` (7 migraciones, aplicadas tanto en `golden_bites` como en `golden_bites_test`).

## Vulnerabilidad preexistente (no relacionada)

`npm audit` en el frontend reporta una vulnerabilidad alta en `react-router-dom` (CSRF bypass en modo RSC, GHSA-qwww-vcr4-c8h2). El fix requiere downgrade breaking. No se aplicó — queda para que el usuario decida.

## Estructura de módulos creados (`GB/src/modules/`)

```
auth/            types, store, api, hooks (login/logout/me/permissions), components (protected-route, can), pages (LoginPage), schemas
products/        types, api, hooks (CRUD + status)
product-categories/ types, api, hooks (list + create)
customers/       types, api, hooks (CRUD + direcciones)
suppliers/       types, api, hooks (CRUD + status)
orders/          types (order, payment), api, hooks (CRUD, status, pagos), order-status.ts (labels/tonos/transiciones)
kitchen/         api, hooks (cola, cambiar estado)
cash-sessions/   types, api, hooks (actual, historial, abrir/cerrar/movimiento)
inventory/       types, api, hooks (items, stock, low-stock, movimientos, ajustes)
purchases/       types (orden, recepción), api, hooks (CRUD, transiciones, recepción), purchase-order-status.ts
waste/           types, api, hooks (listar/crear)
analytics/       types, api, hooks (ventas por día, top productos)
dashboard/       types, api, hooks (resumen)
businesses/      types, api, hooks (obtener/actualizar negocio propio)
branches/        types, api, hooks (listar sedes)
settings/        api, hooks (actualizar tasa de impuesto)
employees/       types, api, hooks (CRUD + status + turnos), employee-status.ts
checklists/      types, api, hooks (plantillas: CRUD+items+status; ejecuciones: start/items/complete), checklist-status.ts
maintenance/     types, api, hooks (equipos: CRUD+status; intervenciones: add/remove), equipment-status.ts
loyalty/         types, api, hooks (config, recompensas CRUD+status, movimientos, canje)
marketing/       types, api, hooks (campañas, cupones+status, contenido, influencers — 4 sub-recursos), marketing-status.ts
documents/       types, api, hooks (CRUD), document-status.ts (estado derivado de expirationDate en el cliente)
finances/        types, api, hooks (gastos CRUD, resumen por categoría), expense-category.ts

lib/api/         api-client, api-error, api-types, token-storage
lib/health/      health.api, use-backend-health
lib/query-client.ts
```

## Módulos backend sin integrar (fuera de alcance de esta entrega)

- `recipes` (costeo de productos por receta)
- `inventory-locations`, `inventory-transfers`, `inventory-counts`
- `roles`, `permissions` (gestión de roles/permisos vía UI)
- `audit` (bitácora de auditoría)
