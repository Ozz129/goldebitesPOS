import { Injectable } from '@nestjs/common';
import { generateTemporaryPassword } from '../../../common/utils/generate-password.util';
import { EntityNotFoundException } from '../../../common/exceptions';
import { AuditService } from '../../audit/services/audit.service';
import { Business } from '../../businesses/domain/business.interface';
import { BusinessesService } from '../../businesses/services/businesses.service';
import { BranchesService } from '../../branches/services/branches.service';
import {
  BusinessFeaturesService,
  FeatureStatus,
} from '../../business-features/services/business-features.service';
import { RolesService } from '../../roles/services/roles.service';
import { UsersService } from '../../users/services/users.service';
import { CreatePlatformBusinessDto } from '../dto/create-platform-business.dto';

const DEFAULT_BRANCH_NAME = 'Sede Principal';

export interface BusinessUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  status: string;
}

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly businessesService: BusinessesService,
    private readonly branchesService: BranchesService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly businessFeaturesService: BusinessFeaturesService,
    private readonly auditService: AuditService,
  ) {}

  async listBusinesses(): Promise<Business[]> {
    return this.businessesService.findAll();
  }

  /**
   * Provisions a business end to end: business + default branch + system
   * roles (via BusinessesService.create) + a first OWNER user, so it's
   * immediately usable — not just a bare business row.
   */
  async createBusiness(
    dto: CreatePlatformBusinessDto,
    actorUserId: string,
  ): Promise<Business> {
    const business = await this.businessesService.create(
      {
        name: dto.name,
        currency: dto.currency,
        timezone: dto.timezone,
      },
      actorUserId,
    );

    const branch = await this.branchesService.create(
      { businessId: business.id, name: DEFAULT_BRANCH_NAME },
      actorUserId,
    );

    const roles = await this.rolesService.findAllForBusiness(business.id);
    const ownerRole = roles.find((role) => role.name === 'OWNER');
    if (!ownerRole) {
      throw new EntityNotFoundException('Role', 'OWNER');
    }

    await this.usersService.create(
      business.id,
      {
        firstName: dto.ownerFirstName,
        lastName: dto.ownerLastName,
        email: dto.ownerEmail,
        password: dto.ownerPassword,
        roleId: ownerRole.id,
        branchId: branch.id,
      },
      actorUserId,
    );

    return business;
  }

  async getBusinessUsers(businessId: string): Promise<BusinessUserSummary[]> {
    await this.businessesService.findById(businessId);
    const [{ data: users }, roles] = await Promise.all([
      this.usersService.findAll({ businessId, page: 1, limit: 200 }),
      this.rolesService.findAllForBusiness(businessId),
    ]);
    const roleNameById = new Map(roles.map((role) => [role.id, role.name]));

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: roleNameById.get(user.roleId) ?? user.roleId,
      status: user.status,
    }));
  }

  /** Resets a tenant user's password to a new random one, returned once — for when a business's admin is locked out. */
  async resetUserPassword(
    businessId: string,
    userId: string,
    actorUserId: string,
  ): Promise<{ temporaryPassword: string }> {
    const user = await this.usersService.findOne(businessId, userId);
    const temporaryPassword = generateTemporaryPassword();
    await this.usersService.setPasswordHash(user.id, temporaryPassword);

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'user',
      entityId: user.id,
      action: 'PLATFORM_RESET_CREDENTIALS',
    });

    return { temporaryPassword };
  }

  async getFeatures(businessId: string): Promise<FeatureStatus[]> {
    await this.businessesService.findById(businessId);
    return this.businessFeaturesService.getEffectiveCatalog(businessId);
  }

  async setFeature(
    businessId: string,
    featureKey: string,
    enabled: boolean,
  ): Promise<void> {
    await this.businessesService.findById(businessId);
    await this.businessFeaturesService.setFeature(
      businessId,
      featureKey,
      enabled,
    );
  }
}
