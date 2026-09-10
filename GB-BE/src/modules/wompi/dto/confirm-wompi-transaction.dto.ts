import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConfirmWompiTransactionDto {
  @ApiProperty({ description: 'The transaction id Wompi returned via the widget/redirect.' })
  @IsString()
  @MinLength(1)
  wompiTransactionId: string;
}
