import { Module } from '@nestjs/common';

import { CATEGORY_REPOSITORY_TOKEN } from '@/modules/category/application/interfaces/category-repo.interface';
import { CategoryService } from '@/modules/category/application/services/category.service';
import { CategorySeederService } from '@/modules/category/application/services/category-seeder.service';
import { PrismaAdapterCategoryRepository } from '@/modules/category/infrastructure/repositories/prisma-category.repo';
import { CategoryController } from '@/modules/category/presentation/controllers/category.controller';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    CategorySeederService,
    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useClass: PrismaAdapterCategoryRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY_TOKEN, CategoryService],
})
export class CategoryModule {}
