import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmBankTransferManualDto {
  @ApiProperty({ description: 'The bank_transactions.id the cashier picked as the correct match' })
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;
}
