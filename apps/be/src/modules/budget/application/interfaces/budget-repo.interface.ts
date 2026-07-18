import {
  type CreateBudgetCommand,
  type UpdateBudgetCommand,
} from '@/modules/budget/application/commands/budget.command';
import { type Budget } from '@/modules/budget/domain/budget.domain';

export const BUDGET_REPOSITORY_TOKEN = Symbol('BUDGET_REPOSITORY_TOKEN');

export interface IBudgetRepository {
  create(
    userId: string,
    currency: string,
    command: CreateBudgetCommand,
  ): Promise<Budget>;
  findById(userId: string, id: string): Promise<Budget | null>;
  findAllByUser(userId: string, includeArchived: boolean): Promise<Budget[]>;
  findActiveByCategoryIds(
    userId: string,
    categoryIds: string[],
  ): Promise<Budget[]>;
  update(id: string, command: UpdateBudgetCommand): Promise<Budget>;
  delete(id: string): Promise<void>;
  sumExpenses(
    userId: string,
    categoryIds: string[],
    currency: string,
    from: Date,
    to: Date,
  ): Promise<number>;
}
