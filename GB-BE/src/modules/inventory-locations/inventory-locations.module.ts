import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { InventoryLocationsController } from './controllers/inventory-locations.controller';
import { InventoryLocationsRepository } from './repositories/inventory-locations.repository';
import { INVENTORY_LOCATIONS_REPOSITORY } from './repositories/inventory-locations.repository.interface';
import { InventoryLocationsService } from './services/inventory-locations.service';

@Module({
  imports: [BranchesModule, AuditModule],
  controllers: [InventoryLocationsController],
  providers: [
    InventoryLocationsService,
    {
      provide: INVENTORY_LOCATIONS_REPOSITORY,
      useClass: InventoryLocationsRepository,
    },
  ],
  exports: [InventoryLocationsService, INVENTORY_LOCATIONS_REPOSITORY],
})
export class InventoryLocationsModule {}
