import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { SubmitNfcOrderDto } from '../dto/submit-nfc-order.dto';
import { PublicNfcOrdersService } from '../services/public-nfc-orders.service';

/**
 * Order submission for the public NFC menu (GOL-24) — no employee session,
 * no @Permissions()/@Roles(): there is no request.user on a public request.
 * businessId/branchId/tableNumber always come from the token, never the
 * client — see PublicNfcOrdersService.
 */
@ApiTags('Public NFC Orders')
@Public()
@Controller('public/nfc/:token/orders')
export class PublicNfcOrdersController {
  constructor(private readonly publicNfcOrdersService: PublicNfcOrdersService) {}

  @Post()
  @ApiOperation({
    summary:
      "Submit a selection from a table's NFC menu — creates the table's active order, or appends to it if one already exists",
  })
  submit(@Param('token') token: string, @Body() dto: SubmitNfcOrderDto) {
    return this.publicNfcOrdersService.submit(token, dto);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Queryable status of a previously submitted order' })
  getStatus(@Param('token') token: string, @Param('orderId') orderId: string) {
    return this.publicNfcOrdersService.getStatus(token, orderId);
  }
}
