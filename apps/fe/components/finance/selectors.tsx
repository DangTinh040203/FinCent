'use client';

import { type CategoryType } from '@repo/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

import { useAccounts, useCategories } from '@/libs/api/hooks';

interface SelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeId?: string;
  className?: string;
}

export function AccountSelect({
  value,
  onChange,
  placeholder = 'Account',
  excludeId,
  className,
}: SelectorProps) {
  const { data: accounts } = useAccounts();
  const options = (accounts ?? []).filter(
    (account) => account.id !== excludeId,
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CategorySelect({
  value,
  onChange,
  type,
  placeholder = 'Category',
  className,
}: SelectorProps & { type?: CategoryType }) {
  const { data: categories } = useCategories();
  const options = (categories ?? []).filter(
    (category) =>
      !category.isArchived && (type === undefined || category.type === type),
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
