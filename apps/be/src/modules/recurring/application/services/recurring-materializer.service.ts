import { Inject, Injectable } from '@nestjs/common';

import {
  type IRecurringRepository,
  RECURRING_REPOSITORY_TOKEN,
} from '@/modules/recurring/application/interfaces/recurring-repo.interface';
import { CadenceCalculator } from '@/modules/recurring/domain/cadence.strategy';
import { type RecurringRule } from '@/modules/recurring/domain/recurring-rule.domain';

const MATERIALIZATION_HORIZON_DAYS = 35;
const MAX_OCCURRENCES_PER_RULE = 62;

@Injectable()
export class RecurringMaterializerService {
  constructor(
    @Inject(RECURRING_REPOSITORY_TOKEN)
    private readonly recurringRepository: IRecurringRepository,
    private readonly cadenceCalculator: CadenceCalculator,
  ) {}

  get horizon(): Date {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + MATERIALIZATION_HORIZON_DAYS);
    return horizon;
  }

  async materializeRule(rule: RecurringRule): Promise<void> {
    if (rule.isPaused) {
      return;
    }

    const horizon = this.horizon;
    let dueAt = new Date(rule.nextDueAt);
    let generated = 0;

    while (
      dueAt < horizon &&
      generated < MAX_OCCURRENCES_PER_RULE &&
      (!rule.endsAt || dueAt <= rule.endsAt)
    ) {
      await this.recurringRepository.upsertProjectedOccurrence(
        rule.id,
        rule.userId,
        dueAt,
        rule.amount,
      );
      dueAt = this.cadenceCalculator.next(rule.cadence, dueAt, rule.interval);
      generated += 1;
    }
  }

  async rematerializeRule(rule: RecurringRule): Promise<void> {
    await this.recurringRepository.deletePendingOccurrences(rule.id);
    await this.materializeRule(rule);
  }

  nextAfter(rule: RecurringRule, from: Date): Date {
    return this.cadenceCalculator.next(rule.cadence, from, rule.interval);
  }
}
