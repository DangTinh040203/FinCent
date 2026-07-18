import {
  type CreateCategoryCommand,
  type UpdateCategoryCommand,
} from '@/modules/category/application/commands/category.command';
import { type Category } from '@/modules/category/domain/category.domain';
import { type DefaultCategoryDefinition } from '@/modules/category/domain/default-categories';

export const CATEGORY_REPOSITORY_TOKEN = Symbol('CATEGORY_REPOSITORY_TOKEN');

export interface ICategoryRepository {
  create(userId: string, payload: CreateCategoryCommand): Promise<Category>;
  findById(userId: string, id: string): Promise<Category | null>;
  findAllVisibleToUser(userId: string): Promise<Category[]>;
  findChildrenIds(userId: string, parentId: string): Promise<string[]>;
  update(id: string, payload: UpdateCategoryCommand): Promise<Category>;
  upsertSystemCategories(
    definitions: DefaultCategoryDefinition[],
  ): Promise<void>;
}
