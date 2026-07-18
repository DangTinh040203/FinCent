import { CategoryType } from '@repo/shared';

export interface DefaultCategoryDefinition {
  systemKey: string;
  name: string;
  icon: string;
  type: CategoryType;
}

export const DEFAULT_CATEGORIES: DefaultCategoryDefinition[] = [
  { systemKey: 'salary', name: 'Salary', icon: 'briefcase', type: CategoryType.INCOME },
  { systemKey: 'bonus', name: 'Bonus', icon: 'gift', type: CategoryType.INCOME },
  { systemKey: 'interest', name: 'Interest', icon: 'percent', type: CategoryType.INCOME },
  { systemKey: 'other-income', name: 'Other income', icon: 'plus-circle', type: CategoryType.INCOME },
  { systemKey: 'food-dining', name: 'Food & Dining', icon: 'utensils', type: CategoryType.EXPENSE },
  { systemKey: 'groceries', name: 'Groceries', icon: 'shopping-basket', type: CategoryType.EXPENSE },
  { systemKey: 'transport', name: 'Transport', icon: 'car', type: CategoryType.EXPENSE },
  { systemKey: 'housing', name: 'Housing & Rent', icon: 'home', type: CategoryType.EXPENSE },
  { systemKey: 'utilities', name: 'Utilities', icon: 'plug', type: CategoryType.EXPENSE },
  { systemKey: 'health', name: 'Health', icon: 'heart-pulse', type: CategoryType.EXPENSE },
  { systemKey: 'education', name: 'Education', icon: 'graduation-cap', type: CategoryType.EXPENSE },
  { systemKey: 'entertainment', name: 'Entertainment', icon: 'clapperboard', type: CategoryType.EXPENSE },
  { systemKey: 'shopping', name: 'Shopping', icon: 'shopping-bag', type: CategoryType.EXPENSE },
  { systemKey: 'travel', name: 'Travel', icon: 'plane', type: CategoryType.EXPENSE },
  { systemKey: 'bills-fees', name: 'Bills & Fees', icon: 'receipt', type: CategoryType.EXPENSE },
  { systemKey: 'other-expense', name: 'Other expense', icon: 'circle-ellipsis', type: CategoryType.EXPENSE },
];
