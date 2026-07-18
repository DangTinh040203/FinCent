import { Global, Module } from '@nestjs/common';

import { CyclePeriodResolver } from '@/libs/periods/cycle-period.resolver';
import { PERIOD_RESOLVER_TOKEN } from '@/libs/periods/period-resolver.interface';

@Global()
@Module({
  providers: [
    {
      provide: PERIOD_RESOLVER_TOKEN,
      useClass: CyclePeriodResolver,
    },
  ],
  exports: [PERIOD_RESOLVER_TOKEN],
})
export class PeriodsModule {}
