import { PartialType } from '@nestjs/swagger';
import { CreateSideDto } from './create-side.dto';

export class UpdateSideDto extends PartialType(CreateSideDto) {}
