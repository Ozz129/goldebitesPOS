import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { CustomersModule } from '../customers/customers.module';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyRewardsController } from './controllers/loyalty-rewards.controller';
import { LoyaltyMovementsRepository } from './repositories/loyalty-movements.repository';
import { LOYALTY_MOVEMENTS_REPOSITORY } from './repositories/loyalty-movements.repository.interface';
import { LoyaltyRewardsRepository } from './repositories/loyalty-rewards.repository';
import { LOYALTY_REWARDS_REPOSITORY } from './repositories/loyalty-rewards.repository.interface';
import { LoyaltyRewardsService } from './services/loyalty-rewards.service';
import { LoyaltyService } from './services/loyalty.service';

@Module({
  imports: [BusinessesModule, CustomersModule, AuditModule],
  controllers: [LoyaltyController, LoyaltyRewardsController],
  providers: [
    LoyaltyService,
    LoyaltyRewardsService,
    {
      provide: LOYALTY_REWARDS_REPOSITORY,
      useClass: LoyaltyRewardsRepository,
    },
    {
      provide: LOYALTY_MOVEMENTS_REPOSITORY,
      useClass: LoyaltyMovementsRepository,
    },
  ],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
