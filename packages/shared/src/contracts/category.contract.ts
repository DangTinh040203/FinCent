import { type CategoryType } from '../enums/category.enum';

export interface CategoryDto {
  id: string;
  name: string;
  icon: string | null;
  type: CategoryType;
  parentId: string | null;
  isSystem: boolean;
  isArchived: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  parentId?: string | null;
  isArchived?: boolean;
}
