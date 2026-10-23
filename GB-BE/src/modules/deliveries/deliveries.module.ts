import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { DeliveriesController } from './controllers/deliveries.controller';
import { PublicDeliveryTrackingController } from './controllers/public-delivery-tracking.controller';
import { DeliveriesRepository } from './repositories/deliveries.repository';
import { DeliveryTrackingRepository } from './repositories/delivery-tracking.repository';
import { DeliveriesService } from './services/deliveries.service';
import { DeliveryLocationService } from './services/delivery-location.service';
import { DeliveryTrackingService } from './services/delivery-tracking.service';
import { DeliveryRemindersService } from './services/delivery-reminders.service';

@Module({
  imports: [AuditModule, PushNotificationsModule],
  controllers: [DeliveriesController, PublicDeliveryTrackingController],
  providers: [
    DeliveriesService,
    DeliveryRemindersService,
    DeliveryLocationService,
    DeliveryTrackingService,
    DeliveriesRepository,
    DeliveryTrackingRepository,
  ],
  // The orders tell it when an order is ready (the courier picks it up).
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
