import { Module } from '@nestjs/common';

import { AccountModule } from '@/modules/account/account.module';
import { CategoryModule } from '@/modules/category/category.module';
import { TRANSACTION_REPOSITORY_TOKEN } from '@/modules/transaction/application/interfaces/transaction-repo.interface';
import { TransactionService } from '@/modules/transaction/application/services/transaction.service';
import { PrismaAdapterTransactionRepository } from '@/modules/transaction/infrastructure/repositories/prisma-transaction.repo';
import { TransactionController } from '@/modules/transaction/presentation/controllers/transaction.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule, AccountModule, CategoryModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: PrismaAdapterTransactionRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY_TOKEN, TransactionService],
})
export class TransactionModule {}
