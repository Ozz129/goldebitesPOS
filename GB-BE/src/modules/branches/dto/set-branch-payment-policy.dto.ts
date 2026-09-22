import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentPolicy } from '../domain/branch.interface';

export class SetBranchPaymentPolicyDto {
  @ApiProperty({ enum: PaymentPolicy })
  @IsEnum(PaymentPolicy)
  paymentPolicy: PaymentPolicy;
}
