import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type CreateCategoryCommand,
  type UpdateCategoryCommand,
} from '@/modules/category/application/commands/category.command';
import {
  CATEGORY_REPOSITORY_TOKEN,
  type ICategoryRepository,
} from '@/modules/category/application/interfaces/category-repo.interface';
import { Category } from '@/modules/category/domain/category.domain';
import { type User } from '@/modules/user/domain';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async list(user: User): Promise<Category[]> {
    return this.categoryRepository.findAllVisibleToUser(user.id);
  }

  async get(user: User, id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(user.id, id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async resolveCategoryIdsIncludingChildren(
    user: User,
    categoryId: string,
  ): Promise<string[]> {
    const childrenIds = await this.categoryRepository.findChildrenIds(
      user.id,
      categoryId,
    );
    return [categoryId, ...childrenIds];
  }

  async create(user: User, command: CreateCategoryCommand): Promise<Category> {
    if (command.parentId) {
      const parent = await this.get(user, command.parentId);
      if (parent.type !== command.type) {
        throw new BadRequestException(
          'Parent category must have the same type',
        );
      }
    }
    return this.categoryRepository.create(user.id, command);
  }

  async update(
    user: User,
    id: string,
    command: UpdateCategoryCommand,
  ): Promise<Category> {
    const category = await this.get(user, id);

    if (category.isSystem) {
      throw new ForbiddenException('System categories cannot be modified');
    }

    if (command.parentId) {
      if (command.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      const parent = await this.get(user, command.parentId);
      if (parent.type !== category.type) {
        throw new BadRequestException(
          'Parent category must have the same type',
        );
      }
    }

    return this.categoryRepository.update(id, command);
  }
}
