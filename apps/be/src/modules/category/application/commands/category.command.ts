import { type CategoryType } from '@repo/shared';

export interface CreateCategoryCommand {
  name: string;
  type: CategoryType;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryCommand {
  name?: string;
  icon?: string;
  parentId?: string | null;
  isArchived?: boolean;
}
