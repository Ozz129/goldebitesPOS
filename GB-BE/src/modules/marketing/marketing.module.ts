import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CampaignsController } from './controllers/campaigns.controller';
import { ContentItemsController } from './controllers/content-items.controller';
import { CouponsController } from './controllers/coupons.controller';
import { InfluencersController } from './controllers/influencers.controller';
import { CampaignsRepository } from './repositories/campaigns.repository';
import { CAMPAIGNS_REPOSITORY } from './repositories/campaigns.repository.interface';
import { ContentItemsRepository } from './repositories/content-items.repository';
import { CONTENT_ITEMS_REPOSITORY } from './repositories/content-items.repository.interface';
import { CouponsRepository } from './repositories/coupons.repository';
import { COUPONS_REPOSITORY } from './repositories/coupons.repository.interface';
import { InfluencersRepository } from './repositories/influencers.repository';
import { INFLUENCERS_REPOSITORY } from './repositories/influencers.repository.interface';
import { CampaignsService } from './services/campaigns.service';
import { ContentItemsService } from './services/content-items.service';
import { CouponsService } from './services/coupons.service';
import { InfluencersService } from './services/influencers.service';

@Module({
  imports: [AuditModule],
  controllers: [
    CampaignsController,
    CouponsController,
    ContentItemsController,
    InfluencersController,
  ],
  providers: [
    CampaignsService,
    CouponsService,
    ContentItemsService,
    InfluencersService,
    { provide: CAMPAIGNS_REPOSITORY, useClass: CampaignsRepository },
    { provide: COUPONS_REPOSITORY, useClass: CouponsRepository },
    { provide: CONTENT_ITEMS_REPOSITORY, useClass: ContentItemsRepository },
    { provide: INFLUENCERS_REPOSITORY, useClass: InfluencersRepository },
  ],
})
export class MarketingModule {}
