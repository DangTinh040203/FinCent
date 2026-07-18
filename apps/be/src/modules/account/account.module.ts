import { Module } from '@nestjs/common';

import { ACCOUNT_REPOSITORY_TOKEN } from '@/modules/account/application/interfaces/account-repo.interface';
import { AccountService } from '@/modules/account/application/services/account.service';
import { PrismaAdapterAccountRepository } from '@/modules/account/infrastructure/repositories/prisma-account.repo';
import { AccountController } from '@/modules/account/presentation/controllers/account.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    {
      provide: ACCOUNT_REPOSITORY_TOKEN,
      useClass: PrismaAdapterAccountRepository,
    },
  ],
  exports: [ACCOUNT_REPOSITORY_TOKEN, AccountService],
})
export class AccountModule {}
