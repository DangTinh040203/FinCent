import { type CategoryDto, type CategoryType } from '@repo/shared';

export class Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  type: CategoryType;
  parentId: string | null;
  systemKey: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }

  get isSystem(): boolean {
    return this.userId === null;
  }

  toDto(): CategoryDto {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      type: this.type,
      parentId: this.parentId,
      isSystem: this.isSystem,
      isArchived: this.isArchived,
    };
  }
}
