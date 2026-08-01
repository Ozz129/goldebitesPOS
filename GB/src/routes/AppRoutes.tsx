import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ProtectedRoute from './ProtectedRoute';
import AuthProtectedRoute from '../modules/auth/components/protected-route';
import ForbiddenPage from './ForbiddenPage';
import NotFoundPage from './NotFoundPage';
import { MODULE_PATHS, MODULE_PERMISSIONS } from './navConfig';
import { KIOSK_PATHS, KIOSK_PERMISSIONS } from './kioskConfig';

const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage'));

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'));
const KitchenPage = lazy(() => import('../features/kitchen/pages/KitchenPage'));
const CashRegisterPage = lazy(() => import('../features/cash-register/pages/CashRegisterPage'));
const ProductsPage = lazy(() => import('../features/products/pages/ProductsPage'));
const InventoryPage = lazy(() => import('../features/inventory/pages/InventoryPage'));
const PurchasesPage = lazy(() => import('../features/purchases/pages/PurchasesPage'));
const SuppliersPage = lazy(() => import('../features/suppliers/pages/SuppliersPage'));
const CustomersPage = lazy(() => import('../features/customers/pages/CustomersPage'));
const LoyaltyPage = lazy(() => import('../features/loyalty/pages/LoyaltyPage'));
const FinancesPage = lazy(() => import('../features/finances/pages/FinancesPage'));
const EmployeesPage = lazy(() => import('../features/employees/pages/EmployeesPage'));
const ChecklistsPage = lazy(() => import('../features/checklists/pages/ChecklistsPage'));
const WastePage = lazy(() => import('../features/waste/pages/WastePage'));
const MaintenancePage = lazy(() => import('../features/maintenance/pages/MaintenancePage'));
const DocumentsPage = lazy(() => import('../features/documents/pages/DocumentsPage'));
const MarketingPage = lazy(() => import('../features/marketing/pages/MarketingPage'));
const AnalyticsPage = lazy(() => import('../features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));
const RolesPage = lazy(() => import('../features/roles/pages/RolesPage'));
const WaiterKioskPage = lazy(() => import('../features/kiosk-waiter/pages/WaiterKioskPage'));
const KitchenKioskPage = lazy(() => import('../features/kiosk-kitchen/pages/KitchenKioskPage'));
const CarServiceKioskPage = lazy(() => import('../features/kiosk-car-service/pages/CarServiceKioskPage'));

function Loadable({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSkeleton variant="page" />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Loadable>
            <LoginPage />
          </Loadable>
        }
      />
      <Route element={<AuthProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.dashboard} />}>
            <Route
              path={MODULE_PATHS.dashboard}
              element={
                <Loadable>
                  <DashboardPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.orders} />}>
            <Route
              path={MODULE_PATHS.orders}
              element={
                <Loadable>
                  <OrdersPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.kitchen} />}>
            <Route
              path={MODULE_PATHS.kitchen}
              element={
                <Loadable>
                  <KitchenPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS['cash-register']} />}>
            <Route
              path={MODULE_PATHS['cash-register']}
              element={
                <Loadable>
                  <CashRegisterPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.products} />}>
            <Route
              path={MODULE_PATHS.products}
              element={
                <Loadable>
                  <ProductsPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.inventory} />}>
            <Route
              path={MODULE_PATHS.inventory}
              element={
                <Loadable>
                  <InventoryPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.purchases} />}>
            <Route
              path={MODULE_PATHS.purchases}
              element={
                <Loadable>
                  <PurchasesPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.suppliers} />}>
            <Route
              path={MODULE_PATHS.suppliers}
              element={
                <Loadable>
                  <SuppliersPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.customers} />}>
            <Route
              path={MODULE_PATHS.customers}
              element={
                <Loadable>
                  <CustomersPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.loyalty} />}>
            <Route
              path={MODULE_PATHS.loyalty}
              element={
                <Loadable>
                  <LoyaltyPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.finances} />}>
            <Route
              path={MODULE_PATHS.finances}
              element={
                <Loadable>
                  <FinancesPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.employees} />}>
            <Route
              path={MODULE_PATHS.employees}
              element={
                <Loadable>
                  <EmployeesPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.checklists} />}>
            <Route
              path={MODULE_PATHS.checklists}
              element={
                <Loadable>
                  <ChecklistsPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.waste} />}>
            <Route
              path={MODULE_PATHS.waste}
              element={
                <Loadable>
                  <WastePage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.maintenance} />}>
            <Route
              path={MODULE_PATHS.maintenance}
              element={
                <Loadable>
                  <MaintenancePage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.documents} />}>
            <Route
              path={MODULE_PATHS.documents}
              element={
                <Loadable>
                  <DocumentsPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.marketing} />}>
            <Route
              path={MODULE_PATHS.marketing}
              element={
                <Loadable>
                  <MarketingPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.analytics} />}>
            <Route
              path={MODULE_PATHS.analytics}
              element={
                <Loadable>
                  <AnalyticsPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.settings} />}>
            <Route
              path={MODULE_PATHS.settings}
              element={
                <Loadable>
                  <SettingsPage />
                </Loadable>
              }
            />
          </Route>
          <Route element={<ProtectedRoute permission={MODULE_PERMISSIONS.roles} />}>
            <Route
              path={MODULE_PATHS.roles}
              element={
                <Loadable>
                  <RolesPage />
                </Loadable>
              }
            />
          </Route>
          <Route path="/sin-acceso" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute permission={KIOSK_PERMISSIONS.waiter} />}>
          <Route
            path={KIOSK_PATHS.waiter}
            element={
              <Loadable>
                <WaiterKioskPage />
              </Loadable>
            }
          />
        </Route>
        <Route element={<ProtectedRoute permission={KIOSK_PERMISSIONS.kitchen} />}>
          <Route
            path={KIOSK_PATHS.kitchen}
            element={
              <Loadable>
                <KitchenKioskPage />
              </Loadable>
            }
          />
        </Route>
        <Route element={<ProtectedRoute permission={KIOSK_PERMISSIONS.carService} />}>
          <Route
            path={KIOSK_PATHS.carService}
            element={
              <Loadable>
                <CarServiceKioskPage />
              </Loadable>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
