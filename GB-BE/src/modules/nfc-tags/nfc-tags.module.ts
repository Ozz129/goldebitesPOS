import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { NfcTagsController } from './controllers/nfc-tags.controller';
import { PublicNfcController } from './controllers/public-nfc.controller';
import { NfcTagsRepository } from './repositories/nfc-tags.repository';
import { NFC_TAGS_REPOSITORY } from './repositories/nfc-tags.repository.interface';
import { NfcTagsService } from './services/nfc-tags.service';

@Module({
  imports: [AuditModule, BranchesModule],
  controllers: [NfcTagsController, PublicNfcController],
  providers: [
    NfcTagsService,
    { provide: NFC_TAGS_REPOSITORY, useClass: NfcTagsRepository },
  ],
  exports: [NfcTagsService],
})
export class NfcTagsModule {}
