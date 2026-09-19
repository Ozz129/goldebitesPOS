import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { GetFundBalanceQueryDto } from '../dto/get-fund-balance-query.dto';
import { InitializeBankAccountDto } from '../dto/initialize-bank-account.dto';
import { InitializeReserveDto } from '../dto/initialize-reserve.dto';
import { FundsService } from '../services/funds.service';

/**
 * Only what GOL-12 exposes to users directly: one-time initialization of
 * Reserva/Cuenta bancaria, and reading a balance. There is deliberately no
 * generic "create a movement" endpoint — FundsService.credit()/debit() are
 * meant to be called by other modules (GOL-5/6/7/9), not by an HTTP client.
 */
@ApiTags('Funds')
@ApiBearerAuth()
@RequiresFeature('finances.funds')
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Post('reserve/initialize')
  @Permissions('finances.manage')
  @ApiOperation({ summary: 'Initialize a location\'s Reserva de efectivo — once only' })
  initializeReserve(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: InitializeReserveDto,
  ) {
    return this.fundsService.initializeReserve({
      businessId,
      branchId: dto.branchId,
      amount: dto.amount,
      notes: dto.notes,
      actorUserId,
    });
  }

  @Post('bank-account/initialize')
  @Permissions('finances.manage')
  @ApiOperation({ summary: 'Initialize Golden Bites\' single Cuenta bancaria — once only' })
  initializeBankAccount(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: InitializeBankAccountDto,
  ) {
    return this.fundsService.initializeBankAccount({
      businessId,
      amount: dto.amount,
      notes: dto.notes,
      actorUserId,
    });
  }

  @Get()
  @Permissions('finances.read')
  @ApiOperation({ summary: 'Get a fund\'s current balance and location' })
  getBalance(@CurrentBusiness() businessId: string, @Query() query: GetFundBalanceQueryDto) {
    return this.fundsService.getBalance(businessId, query.fundType, query.branchId);
  }
}
