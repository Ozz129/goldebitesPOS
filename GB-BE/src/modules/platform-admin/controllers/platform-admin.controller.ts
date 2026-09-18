import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePlatformAdmin } from '../../../common/decorators/require-platform-admin.decorator';
import { CreatePlatformBusinessDto } from '../dto/create-platform-business.dto';
import { SetFeatureDto } from '../dto/set-feature.dto';
import { PlatformAdminService } from '../services/platform-admin.service';

/**
 * Cross-tenant endpoints for platform operators. Unlike every other
 * controller in this backend, these take the target businessId explicitly
 * (path param), never from @CurrentBusiness() — that's the whole point.
 */
@ApiTags('Platform Admin')
@ApiBearerAuth()
@RequirePlatformAdmin()
@Controller('platform-admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('businesses')
  @ApiOperation({ summary: 'List every business on the platform' })
  listBusinesses() {
    return this.platformAdminService.listBusinesses();
  }

  @Post('businesses')
  @ApiOperation({
    summary:
      'Provision a new business with its default branch, roles, and first owner user',
  })
  createBusiness(
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreatePlatformBusinessDto,
  ) {
    return this.platformAdminService.createBusiness(dto, actorUserId);
  }

  @Get('businesses/:id/users')
  @ApiOperation({ summary: "List a business's users (for resetting access)" })
  getBusinessUsers(@Param('id') businessId: string) {
    return this.platformAdminService.getBusinessUsers(businessId);
  }

  @Post('businesses/:id/users/:userId/reset-password')
  @ApiOperation({
    summary:
      "Reset a business user's password (returns the new temporary password once)",
  })
  resetUserPassword(
    @CurrentUser('userId') actorUserId: string,
    @Param('id') businessId: string,
    @Param('userId') userId: string,
  ) {
    return this.platformAdminService.resetUserPassword(
      businessId,
      userId,
      actorUserId,
    );
  }

  @Get('businesses/:id/features')
  @ApiOperation({ summary: "Get a business's effective feature catalog" })
  getFeatures(@Param('id') businessId: string) {
    return this.platformAdminService.getFeatures(businessId);
  }

  @Put('businesses/:id/features/:key')
  @ApiOperation({ summary: 'Enable or disable a module or sub-feature for a business' })
  setFeature(
    @CurrentUser('userId') actorUserId: string,
    @Param('id') businessId: string,
    @Param('key') featureKey: string,
    @Body() dto: SetFeatureDto,
  ) {
    return this.platformAdminService.setFeature(
      businessId,
      featureKey,
      dto.enabled,
      actorUserId,
    );
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get the platform-wide feature flag catalog — applies to every business at once' })
  getFeatureFlags() {
    return this.platformAdminService.getFeatureFlags();
  }

  @Put('feature-flags/:key')
  @ApiOperation({ summary: 'Enable or disable a feature platform-wide, for every business' })
  setFeatureFlag(
    @CurrentUser('userId') actorUserId: string,
    @CurrentBusiness() businessId: string,
    @Param('key') featureKey: string,
    @Body() dto: SetFeatureDto,
  ) {
    return this.platformAdminService.setFeatureFlag(
      featureKey,
      dto.enabled,
      actorUserId,
      businessId,
    );
  }
}
