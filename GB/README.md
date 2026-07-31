# Golden Bites Admin

Panel de administración interno para **Golden Bites**, restaurante premium de tenders de pollo en Popayán, Colombia. Cubre el ciclo completo de la operación: pedidos, cocina, caja, inventario, compras, personal, fidelización, finanzas y cumplimiento — con una identidad visual negra y dorada, tema oscuro por defecto y datos 100% mock listos para reemplazar por una API real.

> "El antojo subió de categoría."

## Stack

- **React 19 + TypeScript + Vite** — base de la aplicación.
- **Material UI (MUI) v9** — sistema de componentes, tema oscuro/claro personalizado.
- **React Router** — enrutamiento y protección de rutas por rol.
- **Zustand** — estado global por dominio, con persistencia en `localStorage`.
- **React Hook Form + Zod** — formularios y validaciones tipadas.
- **TanStack Table** — tablas de datos (ordenamiento, paginación).
- **TanStack Query** — cliente preparado para una futura integración con API REST (`QueryClientProvider` ya configurado en `src/app/App.tsx`).
- **Recharts** — gráficas del dashboard, finanzas y analítica.
- **Lucide React** — iconografía.
- **Notistack** — sistema de notificaciones tipo toast.

## Instalación

Requiere Node.js 20+.

```bash
npm install
cp .env.example .env.development   # ajusta VITE_API_BASE_URL si tu backend no corre en localhost:3000
```

## Ejecución

```bash
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build       # typecheck (tsc -b) + build de producción a dist/
npm run preview     # sirve el build de producción localmente
npm run lint         # ESLint
npm run typecheck   # solo verificación de tipos
npm run format       # Prettier
```

## Integración con el backend (GB-BE)

Requiere el backend `GB-BE` corriendo (ver su propio README). Orden recomendado:

1. PostgreSQL disponible en `localhost:5432`.
2. `GB-BE`: `npm install && npm run migration:run && npm run seed && npm run start:dev` (API en `http://localhost:3000/api/v1`, Swagger en `/api/docs`).
3. `GB`: `npm install && npm run dev`.
4. Abrir `http://localhost:5173` e iniciar sesión con el usuario creado por `npm run seed` en el backend.

Variables de entorno (`.env.development`, ver `.env.example`):

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Capa de integración real (ver también `INTEGRATION_STATUS.md` en la raíz del monorepo):

- `src/config/env.ts` — variables de entorno tipadas.
- `src/lib/api/` — cliente Axios centralizado (`api-client.ts`), normalización de errores (`api-error.ts`), tipos de envelope (`api-types.ts`) y almacenamiento aislado del refresh token (`token-storage.ts`). Maneja renovación automática de access token en 401 (con deduplicación de refresh concurrentes) y cierre de sesión si el refresh falla.
- `src/lib/query-client.ts` — configuración de TanStack Query (reintentos por código de estado).
- `src/lib/health/` — chequeo de conectividad con el backend (indicador discreto en el header, solo en desarrollo).
- `src/modules/auth/` — sesión real (login/logout/refresh contra `/auth/*`), `usePermissions`/`<Can>` basados en los permisos reales del JWT, y el guard de autenticación de rutas.
- `src/modules/products/` — capa API + hooks de TanStack Query para `/products`, con query key factory (`products.keys.ts`).

Los módulos restantes (Pedidos, Cocina, Caja, Inventario, Compras, Proveedores, Clientes, Fidelización, Finanzas, Personal, Checklists, Mermas, Mantenimiento, Documentos, Marketing, Analítica) siguen en mock — ver `INTEGRATION_STATUS.md` para el detalle de qué tiene endpoint real disponible en el backend y qué no.

## Arquitectura

```text
src/
  app/            App.tsx: providers raíz (tema MUI, React Query, Snackbar, Router)
  assets/         Recursos estáticos
  components/
    common/       Componentes reutilizables (PageHeader, DataTable, StatCard, StatusChip,
                   ConfirmDialog, EmptyState, ErrorState, LoadingSkeleton, CurrencyDisplay,
                   DateDisplay, SearchInput, FilterBar, AlertPanel, FormDrawer, DetailDrawer...)
    layout/        Sidebar colapsable, Header (buscador + notificaciones + perfil), AppLayout
    feedback/      (reservado para componentes de feedback adicionales)
  features/       Un directorio por dominio de negocio (ver tabla abajo). Cada uno con:
                   components/, pages/, mocks/, schemas/ (si aplica), types.ts, utils.ts
  hooks/          Hooks compartidos (usePermissions, ...)
  mocks/          Generadores de datos colombianos compartidos (nombres, teléfonos, barrios)
  routes/         Definición de rutas, guardas de permisos, navConfig del sidebar
  services/       Capa de servicios simulados (ej. globalSearch — índice de búsqueda global)
  store/          Stores de Zustand por dominio (persistidos en localStorage) + barrel index.ts
  theme/          Paleta de marca y tema MUI (modo oscuro por defecto)
  types/          Tipos compartidos (roles, canales, métodos de pago, unidades de medida)
  utils/          Formato de moneda/fecha es-CO, generación de ids/folios
```

### Módulos implementados

| Módulo | Ruta | Nivel de profundidad |
|---|---|---|
| Centro de operaciones | `/` | Dashboard completo con KPIs, gráficas Recharts y alertas |
| Pedidos | `/pedidos` | Tabla + Kanban, drawer de detalle, creación manual, cambio de estado, cronómetro |
| Cocina (KDS) | `/cocina` | Kitchen Display System con tarjetas grandes, checklist por producto, pantalla completa |
| Caja | `/caja` | Apertura/cierre de turno, movimientos, cuadre, historial de sesiones |
| Productos | `/productos` | CRUD conectado al backend real (`GB-BE`): nombre, SKU, precio, costo, activar/desactivar. La receta/costeo por insumo y los modificadores quedaron fuera de esta integración — ver `INTEGRATION_STATUS.md` |
| Inventario | `/inventario` | Movimientos (entrada/salida/ajuste/conteo), alertas de stock y vencimiento |
| Compras | `/compras` | Sugerencia automática por stock mínimo, órdenes de compra, recepción de mercancía |
| Proveedores | `/proveedores` | Directorio, condiciones, comparación de precios históricos |
| Clientes | `/clientes` | Segmentación, historial de compras, notas editables |
| Fidelización | `/fidelizacion` | Configuración de puntos, niveles, catálogo de recompensas, canje |
| Finanzas | `/finanzas` | KPIs por periodo, comparativo ingresos/gastos, punto de equilibrio |
| Personal | `/personal` | Ficha de empleado, calendario semanal de turnos, evaluaciones |
| Checklists | `/checklists` | Ejecución guiada de rutinas de apertura/cierre con evidencia |
| Mermas | `/mermas` | Registro de pérdidas con cálculo automático de valor e impacto diario/semanal/mensual |
| Mantenimiento | `/mantenimiento` | Equipos, garantías, historial de intervenciones |
| Documentos | `/documentos` | Cumplimiento legal/sanitario con alertas de vencimiento |
| Marketing | `/marketing` | Campañas, calendario de contenido, cupones, influencers |
| Analítica | `/analitica` | Reportes de ventas por categoría/producto/canal, márgenes, mermas, rotación |
| Configuración | `/configuracion` | Datos del negocio, impuestos, canales, permisos por rol, preferencias visuales |

Los módulos **Pedidos, Cocina, Caja, Productos e Inventario** tienen la profundidad funcional solicitada como prioridad. El resto son igualmente interactivos donde el enunciado lo pedía explícitamente (Checklists, Mermas, Fidelización, Compras) y navegables con datos realistas en los demás casos.

## Decisiones técnicas

- **Persistencia**: cada store de Zustand usa el middleware `persist` con una clave `gb-*` propia en `localStorage`. Esto simula un backend con estado durable sin necesidad de servidor.
- **Autenticación y roles**: la sesión (usuario, rol, permisos) viene del backend vía JWT (`src/modules/auth/`). `src/routes/ProtectedRoute.tsx` sigue filtrando la navegación del sidebar por módulo usando `ROLE_MODULES` (`src/types/role.ts`), mapeado desde el rol real del backend por `roleFromBackendRoleName` — es un filtro cosmético de navegación, no reemplaza la autorización real, que ocurre en el backend vía `PermissionsGuard`. Para gating fino de acciones (crear/editar/eliminar) se usa `usePermissions`/`<Can>` de `src/modules/auth/`, que lee los códigos de permiso reales del JWT. Ver `INTEGRATION_STATUS.md` para el detalle de por qué ambos sistemas conviven.
- **Costeo de productos**: el costo de cada producto se calcula en tiempo real (`computeProductCost`) a partir de las cantidades de receta y el costo promedio de cada insumo en el store de inventario — si el inventario cambia, el margen del producto se recalcula automáticamente.
- **Búsqueda global**: cada store relevante (pedidos, productos, inventario, clientes, proveedores, personal) registra un proveedor de búsqueda en `src/services/globalSearch.ts` vía `registerSearchProvider`. El barrel `src/store/index.ts` se importa una única vez en `main.tsx` para garantizar que el índice esté listo desde el arranque, sin depender de que el usuario visite cada módulo primero.
- **Moneda y fechas**: todos los montos usan `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` y las fechas usan `Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota' })` (ver `src/utils/format.ts`). No se usan dólares en ninguna parte de la interfaz.
- **Gráficas**: paleta categórica fija (`chartCategorical` en `src/theme/palette.ts`) asignada por entidad (ej. cada canal de venta siempre tiene el mismo color), sin degradados agresivos, con un solo eje por gráfica.
- **Tablas**: `DataTable` envuelve TanStack Table con ordenamiento y paginación consistentes en todos los módulos.

## Próximos pasos para conectar una API real

1. **Reemplazar los stores por llamadas HTTP**: cada store de Zustand en `src/store/*.ts` inicializa su estado desde un mock (`features/<dominio>/mocks/*.ts`). El siguiente paso natural es mover esas llamadas a hooks de TanStack Query (`useQuery`/`useMutation`) contra endpoints REST, manteniendo Zustand solo para estado de UI (sidebar, tema, filtros) y dejando la fuente de verdad del dominio en el servidor.
2. **Capa de servicios**: crear `src/services/api/<dominio>.ts` con funciones `fetch*`, `create*`, `update*` que hoy podrían simplemente envolver los mocks y mañana apunten a `fetch`/`axios`. `src/services/globalSearch.ts` ya está desacoplado de la fuente de datos (usa un patrón de proveedores) por lo que no requiere cambios estructurales.
3. **Autenticación real**: sustituir `src/store/authStore.ts` (usuario y rol fijos con selector de prueba) por un flujo de login real y tokens, manteniendo `ROLE_MODULES` como la fuente de verdad de permisos por rol en el cliente (a validar también en el backend).
4. **Persistencia**: una vez exista API, se recomienda quitar el middleware `persist` de los stores de dominio (pedidos, inventario, caja, etc.) para evitar desincronización con el servidor, dejándolo únicamente en preferencias de UI (`uiStore`).
5. **Websockets / polling**: los módulos de Cocina y Pedidos están diseñados para actualizarse en tiempo real (cronómetros, estados). Al conectar backend, esto se beneficiaría de un canal de websockets o polling corto vía TanStack Query (`refetchInterval`).
6. **Carga de archivos**: Documentos, Proveedores y Personal simulan adjuntos como texto plano (`fileNameSimulated`). Se requiere un servicio de almacenamiento (S3 u otro) para adjuntos reales.

## Datos mock

Los datos (productos, ingredientes, pedidos, clientes, proveedores, empleados, etc.) son ficticios pero realistas para el contexto de Popayán, Cauca: nombres y teléfonos colombianos, direcciones con barrios reales de la ciudad, precios en pesos colombianos y menú basado en el catálogo de tenders de Golden Bites (Golden Classic, BBQ, Buffalo, Honey Mustard, Mix, combos, etc.).
