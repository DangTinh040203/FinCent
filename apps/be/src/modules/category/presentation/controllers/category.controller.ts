import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { type CategoryDto } from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { CategoryService } from '@/modules/category/application/services/category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/modules/category/presentation/DTOs/category.dto';
import { User } from '@/modules/user/domain';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async list(@CurrentDbUser() user: User): Promise<CategoryDto[]> {
    const categories = await this.categoryService.list(user);
    return categories.map((category) => category.toDto());
  }

  @Post()
  async create(
    @CurrentDbUser() user: User,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.categoryService.create(user, dto);
    return category.toDto();
  }

  @Patch(':id')
  async update(
    @CurrentDbUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.categoryService.update(user, id, dto);
    return category.toDto();
  }
}
