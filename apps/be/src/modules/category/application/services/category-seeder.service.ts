import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '@/modules/category/application/interfaces/category-repo.interface';
import { DEFAULT_CATEGORIES } from '@/modules/category/domain/default-categories';

@Injectable()
export class CategorySeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategorySeederService.name);

  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.categoryRepository.upsertSystemCategories(DEFAULT_CATEGORIES);
      this.logger.log(
        `Seeded ${DEFAULT_CATEGORIES.length} system categories`,
      );
    } catch (error) {
      this.logger.error('Failed to seed system categories', error);
    }
  }
}
