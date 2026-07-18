import { Injectable } from '@nestjs/common';
import { type CategoryType } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type Category as CategoryRow } from '@/libs/databases/prisma/generated/client';
import {
  type CreateCategoryCommand,
  type UpdateCategoryCommand,
} from '@/modules/category/application/commands/category.command';
import { type ICategoryRepository } from '@/modules/category/application/interfaces/category-repo.interface';
import { Category } from '@/modules/category/domain/category.domain';
import { type DefaultCategoryDefinition } from '@/modules/category/domain/default-categories';

@Injectable()
export class PrismaAdapterCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    payload: CreateCategoryCommand,
  ): Promise<Category> {
    const row = await this.prisma.category.create({
      data: {
        userId,
        name: payload.name,
        type: payload.type,
        icon: payload.icon ?? null,
        parentId: payload.parentId ?? null,
      },
    });
    return this.toDomain(row);
  }

  async findById(userId: string, id: string): Promise<Category | null> {
    const row = await this.prisma.category.findFirst({
      where: { id, OR: [{ userId }, { userId: null }] },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAllVisibleToUser(userId: string): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findChildrenIds(userId: string, parentId: string): Promise<string[]> {
    const rows = await this.prisma.category.findMany({
      where: { parentId, OR: [{ userId }, { userId: null }] },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  async update(id: string, payload: UpdateCategoryCommand): Promise<Category> {
    const row = await this.prisma.category.update({
      where: { id },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.icon !== undefined && { icon: payload.icon }),
        ...(payload.parentId !== undefined && { parentId: payload.parentId }),
        ...(payload.isArchived !== undefined && {
          isArchived: payload.isArchived,
        }),
      },
    });
    return this.toDomain(row);
  }

  async upsertSystemCategories(
    definitions: DefaultCategoryDefinition[],
  ): Promise<void> {
    for (const definition of definitions) {
      await this.prisma.category.upsert({
        where: { systemKey: definition.systemKey },
        create: {
          systemKey: definition.systemKey,
          name: definition.name,
          icon: definition.icon,
          type: definition.type,
          userId: null,
        },
        update: {
          name: definition.name,
          icon: definition.icon,
        },
      });
    }
  }

  private toDomain(row: CategoryRow): Category {
    return new Category({
      id: row.id,
      userId: row.userId,
      name: row.name,
      icon: row.icon,
      type: row.type as CategoryType,
      parentId: row.parentId,
      systemKey: row.systemKey,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
