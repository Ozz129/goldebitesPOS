import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { CreateInterventionDto } from '../dto/create-intervention.dto';
import { EquipmentQueryDto } from '../dto/equipment-query.dto';
import { SetEquipmentStatusDto } from '../dto/set-equipment-status.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { EquipmentService } from '../services/equipment.service';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @Permissions('maintenance.manage')
  @ApiOperation({ summary: 'Register a piece of equipment' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateEquipmentDto,
  ) {
    return this.equipmentService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('maintenance.read')
  @ApiOperation({ summary: 'List equipment for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: EquipmentQueryDto,
  ) {
    return this.equipmentService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      branchId: query.branchId,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('maintenance.read')
  @ApiOperation({ summary: 'Get equipment with its intervention history' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.equipmentService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('maintenance.manage')
  @ApiOperation({ summary: 'Update equipment' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('maintenance.manage')
  @ApiOperation({ summary: 'Change equipment status' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetEquipmentStatusDto,
  ) {
    return this.equipmentService.setStatus(
      businessId,
      id,
      dto.status,
      actorUserId,
    );
  }

  @Post(':id/interventions')
  @Permissions('maintenance.manage')
  @ApiOperation({ summary: 'Record a maintenance intervention' })
  addIntervention(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: CreateInterventionDto,
  ) {
    return this.equipmentService.addIntervention(
      businessId,
      id,
      dto,
      actorUserId,
    );
  }

  @Delete(':id/interventions/:interventionId')
  @Permissions('maintenance.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Remove a maintenance intervention record' })
  async removeIntervention(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Param('interventionId') interventionId: string,
  ) {
    await this.equipmentService.removeIntervention(
      businessId,
      id,
      interventionId,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('maintenance.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete equipment' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.equipmentService.softDelete(businessId, id, actorUserId);
  }
}
