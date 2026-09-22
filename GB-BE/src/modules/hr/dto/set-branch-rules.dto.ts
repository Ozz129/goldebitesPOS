import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BranchRuleInputDto } from './branch-rule-input.dto';

export class SetBranchRulesDto {
  @ApiProperty({ type: [BranchRuleInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BranchRuleInputDto)
  rules: BranchRuleInputDto[];
}
