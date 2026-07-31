import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { EquipmentController } from './controllers/equipment.controller';
import { EquipmentRepository } from './repositories/equipment.repository';
import { EQUIPMENT_REPOSITORY } from './repositories/equipment.repository.interface';
import { EquipmentService } from './services/equipment.service';

@Module({
  imports: [AuditModule],
  controllers: [EquipmentController],
  providers: [
    EquipmentService,
    { provide: EQUIPMENT_REPOSITORY, useClass: EquipmentRepository },
  ],
  exports: [EquipmentService, EQUIPMENT_REPOSITORY],
})
export class MaintenanceModule {}
