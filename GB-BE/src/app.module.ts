import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { CashSessionsModule } from './modules/cash-sessions/cash-sessions.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentScansModule } from './modules/document-scans/document-scans.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FinancesModule } from './modules/finances/finances.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { HealthModule } from './modules/health/health.module';
import { InventoryCountsModule } from './modules/inventory-counts/inventory-counts.module';
import { InventoryItemCategoriesModule } from './modules/inventory-item-categories/inventory-item-categories.module';
import { InventoryItemsModule } from './modules/inventory-items/inventory-items.module';
import { InventoryLocationsModule } from './modules/inventory-locations/inventory-locations.module';
import { InventoryMovementsModule } from './modules/inventory-movements/inventory-movements.module';
import { InventoryTransfersModule } from './modules/inventory-transfers/inventory-transfers.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { RolesModule } from './modules/roles/roles.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { TabletKioskModule } from './modules/tablet-kiosk/tablet-kiosk.module';
import { UsersModule } from './modules/users/users.module';
import { WasteModule } from './modules/waste/waste.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [appConfig, databaseConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    HealthModule,
    AuditModule,
    PermissionsModule,
    RolesModule,
    BusinessesModule,
    BranchesModule,
    UsersModule,
    AuthModule,
    ProductCategoriesModule,
    ProductsModule,
    SuppliersModule,
    InventoryItemCategoriesModule,
    InventoryItemsModule,
    RecipesModule,
    InventoryLocationsModule,
    InventoryMovementsModule,
    InventoryTransfersModule,
    InventoryCountsModule,
    PurchasesModule,
    GoodsReceiptsModule,
    CustomersModule,
    CashSessionsModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    WasteModule,
    SettingsModule,
    DashboardModule,
    AnalyticsModule,
    EmployeesModule,
    ChecklistsModule,
    MaintenanceModule,
    LoyaltyModule,
    MarketingModule,
    DocumentsModule,
    DocumentScansModule,
    FinancesModule,
    TabletKioskModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
