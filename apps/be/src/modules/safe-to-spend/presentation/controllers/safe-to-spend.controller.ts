import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  type SafeToSpendDto,
  type SimulateSpendPayload,
  type SimulateSpendResultDto,
} from '@repo/shared';
import { IsInt, IsPositive } from 'class-validator';

import { CurrentDbUser } from '@/libs/decorators';
import { SafeToSpendService } from '@/modules/safe-to-spend/application/services/safe-to-spend.service';
import { User } from '@/modules/user/domain';

class SimulateSpendDto implements SimulateSpendPayload {
  @IsInt()
  @IsPositive()
  amount: number;
}

@Controller('safe-to-spend')
export class SafeToSpendController {
  constructor(private readonly safeToSpendService: SafeToSpendService) {}

  @Get()
  async get(@CurrentDbUser() user: User): Promise<SafeToSpendDto> {
    return this.safeToSpendService.get(user);
  }

  @Post('simulate')
  async simulate(
    @CurrentDbUser() user: User,
    @Body() dto: SimulateSpendDto,
  ): Promise<SimulateSpendResultDto> {
    return this.safeToSpendService.simulate(user, dto.amount);
  }
}
