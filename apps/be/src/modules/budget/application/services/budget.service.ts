import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BudgetPeriodType,
  BudgetRiskLevel,
  CategoryType,
} from '@repo/shared';

import {
  type IPeriodResolver,
  type Period,
  PERIOD_RESOLVER_TOKEN,
} from '@/libs/periods';
import {
  type CreateBudgetCommand,
  type UpdateBudgetCommand,
} from '@/modules/budget/application/commands/budget.command';
import {
  BUDGET_REPOSITORY_TOKEN,
  type IBudgetRepository,
} from '@/modules/budget/application/interfaces/budget-repo.interface';
import { type Budget } from '@/modules/budget/domain/budget.domain';
import { BudgetStatus } from '@/modules/budget/domain/budget-status';
import { CategoryService } from '@/modules/category/application/services/category.service';
import { type User } from '@/modules/user/domain';

const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class BudgetService {
  constructor(
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(PERIOD_RESOLVER_TOKEN)
    private readonly periodResolver: IPeriodResolver,
    private readonly categoryService: CategoryService,
  ) {}

  async create(user: User, command: CreateBudgetCommand): Promise<Budget> {
    const category = await this.categoryService.get(user, command.categoryId);
    if (category.type !== CategoryType.EXPENSE) {
      throw new BadRequestException(
        'Budgets can only be set for expense categories',
      );
    }

    try {
      return await this.budgetRepository.create(
        user.id,
        user.displayCurrency,
        command,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          'A budget for this category already exists',
        );
      }
      throw error;
    }
  }

  async update(
    user: User,
    id: string,
    command: UpdateBudgetCommand,
  ): Promise<Budget> {
    await this.get(user, id);
    return this.budgetRepository.update(id, command);
  }

  async remove(user: User, id: string): Promise<void> {
    await this.get(user, id);
    await this.budgetRepository.delete(id);
  }

  async get(user: User, id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findById(user.id, id);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  async getStatus(user: User, id: string): Promise<BudgetStatus> {
    const budget = await this.get(user, id);
    return this.computeStatus(user, budget);
  }

  async listStatuses(user: User): Promise<BudgetStatus[]> {
    const budgets = await this.budgetRepository.findAllByUser(user.id, false);
    return Promise.all(
      budgets.map((budget) => this.computeStatus(user, budget)),
    );
  }

  async budgetsAtRisk(user: User): Promise<BudgetStatus[]> {
    const statuses = await this.listStatuses(user);
    return statuses.filter(
      (status) => status.riskLevel !== BudgetRiskLevel.ON_TRACK,
    );
  }

  async statusesForCategory(
    user: User,
    categoryIds: string[],
  ): Promise<BudgetStatus[]> {
    const budgets = await this.budgetRepository.findActiveByCategoryIds(
      user.id,
      categoryIds,
    );
    return Promise.all(
      budgets.map((budget) => this.computeStatus(user, budget)),
    );
  }

  async computeStatus(user: User, budget: Budget): Promise<BudgetStatus> {
    const period = this.resolvePeriod(user, budget);
    const categoryIds =
      await this.categoryService.resolveCategoryIdsIncludingChildren(
        user,
        budget.categoryId,
      );
    const spent = await this.budgetRepository.sumExpenses(
      user.id,
      categoryIds,
      budget.currency,
      period.start,
      period.end,
    );
    return new BudgetStatus(budget, period, spent);
  }

  private resolvePeriod(user: User, budget: Budget): Period {
    return budget.periodType === BudgetPeriodType.WEEKLY
      ? this.periodResolver.resolveWeekly()
      : this.periodResolver.resolveMonthly(user.cycleStartDay);
  }
}
