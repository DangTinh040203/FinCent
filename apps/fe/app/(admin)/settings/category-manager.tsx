'use client';

import {
  type CategoryDto,
  CategoryType,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@repo/shared';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useApi } from '@/components/providers/app-providers';
import { useCategories, useFinancialMutation } from '@/libs/api/hooks';

const NONE = 'NONE';

export function CategoryManager() {
  const api = useApi();
  const { data: categories } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryType.EXPENSE);
  const [parentId, setParentId] = useState<string>(NONE);

  const saveMutation = useFinancialMutation(
    async () => {
      if (editing) {
        const payload: UpdateCategoryPayload = {
          name,
          parentId: parentId === NONE ? null : parentId,
        };
        return api.categories.update(editing.id, payload);
      }
      const payload: CreateCategoryPayload = {
        name,
        type,
        parentId: parentId === NONE ? undefined : parentId,
      };
      return api.categories.create(payload);
    },
    {
      successMessage: editing ? 'Category updated' : 'Category created',
      onSuccess: () => setDialogOpen(false),
    },
  );

  const archiveMutation = useFinancialMutation(
    async (category: CategoryDto) =>
      api.categories.update(category.id, {
        isArchived: !category.isArchived,
      }),
    { successMessage: 'Category updated' },
  );

  const openCreate = () => {
    setEditing(null);
    setName('');
    setType(CategoryType.EXPENSE);
    setParentId(NONE);
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryDto) => {
    setEditing(category);
    setName(category.name);
    setType(category.type);
    setParentId(category.parentId ?? NONE);
    setDialogOpen(true);
  };

  const parentOptions = (categories ?? []).filter(
    (category) =>
      category.type === type &&
      !category.parentId &&
      !category.isArchived &&
      category.id !== editing?.id,
  );

  const renderGroup = (groupType: CategoryType, title: string) => (
    <div className='space-y-2'>
      <p className='text-muted-foreground text-xs font-medium uppercase'>
        {title}
      </p>
      <div className='flex flex-wrap gap-2'>
        {(categories ?? [])
          .filter((category) => category.type === groupType)
          .map((category) => (
            <Badge
              key={category.id}
              variant={category.isArchived ? 'outline' : 'secondary'}
              className={`
                cursor-pointer
                ${category.isArchived ? 'opacity-50' : ''}
              `}
              onClick={() =>
                category.isSystem ? undefined : openEdit(category)
              }
            >
              {category.name}
              {category.isSystem && ' ·'}
              {!category.isSystem && (
                <button
                  className={`
                    ml-1 text-xs underline-offset-2
                    hover:underline
                  `}
                  onClick={(event) => {
                    event.stopPropagation();
                    archiveMutation.mutate(category);
                  }}
                >
                  {category.isArchived ? 'restore' : 'archive'}
                </button>
              )}
            </Badge>
          ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            System categories are built in; add your own and organize them
            into groups.
          </CardDescription>
        </div>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-4' />
          New category
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {renderGroup(CategoryType.EXPENSE, 'Expense categories')}
        {renderGroup(CategoryType.INCOME, 'Income categories')}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.name}` : 'New category'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='category-name'>Name</Label>
              <Input
                id='category-name'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            {!editing && (
              <div className='space-y-1'>
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value as CategoryType);
                    setParentId(NONE);
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CategoryType.EXPENSE}>
                      Expense
                    </SelectItem>
                    <SelectItem value={CategoryType.INCOME}>Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className='space-y-1'>
              <Label>Parent group (optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No parent</SelectItem>
                  {parentOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate(undefined)}
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
