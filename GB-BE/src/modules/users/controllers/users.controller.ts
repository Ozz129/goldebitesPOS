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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { SetUserStatusDto } from '../dto/set-user-status.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Create a user in the current business' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(businessId, dto, actorUserId);
  }

  @Get()
  @Permissions('users.manage')
  @ApiOperation({ summary: 'List users in the current business' })
  findAll(@CurrentBusiness() businessId: string, @Query() query: UserQueryDto) {
    return this.usersService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      roleId: query.roleId,
      branchId: query.branchId,
      search: query.search,
    });
  }

  @Get('me')
  @ApiOperation({ summary: "Get the current user's own profile" })
  findMe(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.usersService.findOne(businessId, userId);
  }

  @Get(':id')
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Get a single user' })
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.usersService.findOne(businessId, id);
  }

  @Patch(':id')
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(businessId, id, dto, actorUserId);
  }

  @Patch(':id/status')
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Change a user status (ACTIVE/INACTIVE/BLOCKED)' })
  setStatus(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: SetUserStatusDto,
  ) {
    return this.usersService.setStatus(businessId, id, dto.status, actorUserId);
  }

  @Delete(':id')
  @Permissions('users.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a user' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.usersService.softDelete(businessId, id, actorUserId);
  }
}
