import { Global, Module } from '@nestjs/common';
import { DatabaseService, pgPoolProvider } from './database.service';
import { TransactionService } from './transaction.service';

@Global()
@Module({
  providers: [pgPoolProvider, DatabaseService, TransactionService],
  exports: [DatabaseService, TransactionService],
})
export class DatabaseModule {}
