import { Controller, Get } from '@nestjs/common';
import { type OverviewDto } from '@repo/shared';

import { CurrentDbUser } from '@/libs/decorators';
import { OverviewService } from '@/modules/overview/application/services/overview.service';
import { User } from '@/modules/user/domain';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get()
  async getOverview(@CurrentDbUser() user: User): Promise<OverviewDto> {
    return this.overviewService.getOverview(user);
  }
}
