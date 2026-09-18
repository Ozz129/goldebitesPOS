import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { CreateReimbursementPaymentDto, VoidReimbursementObligationDto } from '../dto/create-reimbursement-payment.dto';
import { ReimbursementObligationQueryDto } from '../dto/reimbursement-obligation-query.dto';
import { ReimbursementsService } from '../services/reimbursements.service';

@ApiTags('Finances')
@ApiBearerAuth()
@RequiresFeature('finances.reimbursements')
@Controller('reimbursement-obligations')
export class ReimbursementsController {
  constructor(private readonly reimbursementsService: ReimbursementsService) {}

  @Get()
  @Permissions('finances.read')
  @ApiOperation({ summary: 'List reimbursement obligations (expenses paid with personal money)' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: ReimbursementObligationQueryDto,
  ) {
    return this.reimbursementsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      payerEmployeeId: query.payerEmployeeId,
    });
  }

  @Get('summary')
  @Permissions('finances.read')
  @ApiOperation({ summary: 'Count and total amount of pending/partially-reimbursed obligations' })
  getSummary(@CurrentBusiness() businessId: string) {
    return this.reimbursementsService.getSummary(businessId);
  }

  @Get(':id')
  @Permissions('finances.read')
  @ApiOperation({ summary: 'Get an obligation with its full payment history' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.reimbursementsService.findOne(businessId, id);
  }

  @Post(':id/payments')
  @Permissions('finances.manage')
  @ApiOperation({ summary: 'Register a reimbursement payment, paid out of the branch\'s open Caja operativa' })
  payObligation(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: CreateReimbursementPaymentDto,
  ) {
    return this.reimbursementsService.payObligation(
      businessId,
      dto.branchId,
      id,
      dto.amount,
      actorUserId,
      dto.notes,
    );
  }

  @Post(':id/void')
  @Permissions('finances.manage')
  @ApiOperation({ summary: 'Void the remaining pending balance of an obligation (does not reverse payments already made)' })
  voidObligation(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: VoidReimbursementObligationDto,
  ) {
    return this.reimbursementsService.voidObligation(businessId, id, actorUserId, dto.reason);
  }
}
