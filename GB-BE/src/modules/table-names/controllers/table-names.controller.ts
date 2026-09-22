import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ClearTableNameQueryDto } from '../dto/clear-table-name-query.dto';
import { TableNameQueryDto } from '../dto/table-name-query.dto';
import { UpsertTableNameDto } from '../dto/upsert-table-name.dto';
import { TableNamesService } from '../services/table-names.service';

/** Custom display names per table (e.g. "Terraza" instead of "Mesa 5") — independent of NFC tags. Same branches.manage permission as the rest of branch/table configuration. */
@ApiTags('Table Names')
@ApiBearerAuth()
@Controller('table-names')
export class TableNamesController {
  constructor(private readonly tableNamesService: TableNamesService) {}

  @Get()
  @Permissions('branches.manage')
  @ApiOperation({ summary: "List a branch's custom table names" })
  findAllByBranch(@CurrentBusiness() businessId: string, @Query() query: TableNameQueryDto) {
    return this.tableNamesService.findAllByBranch(businessId, query.branchId);
  }

  @Put()
  @Permissions('branches.manage')
  @ApiOperation({ summary: 'Set (create or update) a table\'s custom name' })
  upsert(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: UpsertTableNameDto,
  ) {
    return this.tableNamesService.upsert({ businessId, ...dto, actorUserId });
  }

  @Delete()
  @Permissions('branches.manage')
  @ApiOperation({ summary: 'Clear a table\'s custom name — reverts display to "Mesa {tableNumber}"' })
  clear(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Query() query: ClearTableNameQueryDto,
  ) {
    return this.tableNamesService.clear(businessId, query.branchId, query.tableNumber, actorUserId);
  }
}
