import { Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [BusinessesModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
