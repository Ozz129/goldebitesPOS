import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CreateEmployeeCredentialsDto } from '../dto/create-employee-credentials.dto';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeQueryDto } from '../dto/employee-query.dto';
import { SetEmployeeCredentialsStatusDto } from '../dto/set-employee-credentials-status.dto';
import { SetEmployeeShiftsDto } from '../dto/set-employee-shifts.dto';
import { SetEmployeeStatusDto } from '../dto/set-employee-status.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeesService } from '../services/employees.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@RequiresFeature('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Permissions('employees.manage')
  @ApiOperation({ summary: 'Create an employee' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeesService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('employees.read')
  @ApiOperation({ summary: 'List employees for the current business' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: EmployeeQueryDto,
  ) {
    return this.employeesService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      branchId: query.branchId,
      search: query.search,
    });
  }

  @Get(':id')
  @Permissions('employees.read')
  @ApiOperation({ summary: 'Get an employee with their shift schedule' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.employeesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('employees.manage')
  @ApiOperation({ summary: 'Update an employee' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('employees.manage')
  @ApiOperation({ summary: 'Change an employee status' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetEmployeeStatusDto,
  ) {
    return this.employeesService.setStatus(
      businessId,
      id,
      dto.status,
      actorUserId,
    );
  }

  @Put(':id/shifts')
  @Permissions('employees.manage')
  @ApiOperation({ summary: 'Replace an employee weekly shift schedule' })
  replaceShifts(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetEmployeeShiftsDto,
  ) {
    return this.employeesService.replaceShifts(
      businessId,
      id,
      dto.shifts,
      actorUserId,
    );
  }

  @Delete(':id')
  @Permissions('employees.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete an employee' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.employeesService.softDelete(businessId, id, actorUserId);
  }

  @Post(':id/credentials')
  @Permissions('employees.manage')
  @ApiOperation({
    summary:
      'Generate login credentials for an employee (returns the temporary password once)',
  })
  generateCredentials(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: CreateEmployeeCredentialsDto,
  ) {
    return this.employeesService.generateCredentials(
      businessId,
      id,
      dto,
      actorUserId,
    );
  }

  @Post(':id/credentials/reset')
  @Permissions('employees.manage')
  @ApiOperation({
    summary:
      "Reset an employee's password (returns the new temporary password once)",
  })
  resetCredentials(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.resetCredentials(businessId, id, actorUserId);
  }

  @Patch(':id/credentials/status')
  @Permissions('employees.manage')
  @ApiOperation({
    summary: "Activate, deactivate or block an employee's login access",
  })
  setCredentialsStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetEmployeeCredentialsStatusDto,
  ) {
    return this.employeesService.setCredentialsStatus(
      businessId,
      id,
      dto.status,
      actorUserId,
    );
  }
}
