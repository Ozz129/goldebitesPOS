import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';

const EVERY_MS = 60_000;

/**
 * Once a minute, reminds the couriers of the deliveries waiting for them to
 * set out (DeliveriesService.remindWaitingStarts). Off in tests.
 */
@Injectable()
export class DeliveryRemindersService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(DeliveryRemindersService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly deliveriesService: DeliveriesService) {}

  onApplicationBootstrap(): void {
    if (process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => void this.tick(), EVERY_MS);
    // Never keeps the process alive on its own.
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async tick(): Promise<void> {
    try {
      const reminded = await this.deliveriesService.remindWaitingStarts();
      if (reminded > 0) {
        this.logger.log(
          `Reminded ${reminded} courier(s) of a delivery to start`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Could not remind the couriers',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
