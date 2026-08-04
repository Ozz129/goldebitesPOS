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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentQueryDto } from '../dto/document-query.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentsService } from '../services/documents.service';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@RequiresFeature('documents')
@Controller('compliance-documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Permissions('documents.manage')
  @ApiOperation({ summary: 'Register a compliance document (metadata only)' })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create({ businessId, ...dto }, actorUserId);
  }

  @Get()
  @Permissions('documents.read')
  @ApiOperation({ summary: 'List compliance documents' })
  findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: DocumentQueryDto,
  ) {
    return this.documentsService.findAll({
      businessId,
      page: query.page,
      limit: query.limit,
      category: query.category,
      search: query.search,
    });
  }

  @Patch(':id')
  @Permissions('documents.manage')
  @ApiOperation({ summary: 'Update a compliance document' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(businessId, id, dto, actorUserId);
  }

  @Delete(':id')
  @Permissions('documents.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Soft delete a compliance document' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('id') id: string,
  ) {
    await this.documentsService.softDelete(businessId, id, actorUserId);
  }
}
