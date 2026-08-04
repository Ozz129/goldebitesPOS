import { Module } from '@nestjs/common';
import { BusinessFeaturesRepository } from './repositories/business-features.repository';
import { BUSINESS_FEATURES_REPOSITORY } from './repositories/business-features.repository.interface';
import { BusinessFeaturesService } from './services/business-features.service';

@Module({
  providers: [
    BusinessFeaturesService,
    {
      provide: BUSINESS_FEATURES_REPOSITORY,
      useClass: BusinessFeaturesRepository,
    },
  ],
  exports: [BusinessFeaturesService],
})
export class BusinessFeaturesModule {}
