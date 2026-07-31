import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class ItemResultInputDto {
  @ApiProperty({ description: 'checklist run item id' })
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsBoolean()
  checked: boolean;
}
