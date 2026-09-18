import { Module } from '@nestjs/common';
import { PlatformFeatureFlagsRepository } from './repositories/platform-feature-flags.repository';
import { PLATFORM_FEATURE_FLAGS_REPOSITORY } from './repositories/platform-feature-flags.repository.interface';
import { PlatformFeatureFlagsService } from './services/platform-feature-flags.service';

@Module({
  providers: [
    PlatformFeatureFlagsService,
    {
      provide: PLATFORM_FEATURE_FLAGS_REPOSITORY,
      useClass: PlatformFeatureFlagsRepository,
    },
  ],
  exports: [PlatformFeatureFlagsService],
})
export class PlatformFeatureFlagsModule {}
