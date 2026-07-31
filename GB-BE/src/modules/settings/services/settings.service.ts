import { Injectable } from '@nestjs/common';
import { BusinessesService } from '../../businesses/services/businesses.service';

export interface BusinessSettings {
  taxRate: number;
}

@Injectable()
export class SettingsService {
  constructor(private readonly businessesService: BusinessesService) {}

  async get(businessId: string): Promise<BusinessSettings> {
    const business = await this.businessesService.findById(businessId);
    return { taxRate: business.taxRate };
  }

  async update(
    businessId: string,
    taxRate: number,
    actorUserId?: string,
  ): Promise<BusinessSettings> {
    const business = await this.businessesService.updateTaxRate(
      businessId,
      taxRate,
      actorUserId,
    );
    return { taxRate: business.taxRate };
  }
}
