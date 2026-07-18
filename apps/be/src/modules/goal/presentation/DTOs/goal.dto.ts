import {
  type CreateGoalContributionPayload,
  type CreateGoalPayload,
  GoalPriority,
  GoalStatus,
  type UpdateGoalPayload,
} from '@repo/shared';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateGoalDto implements CreateGoalPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsInt()
  @IsPositive()
  targetAmount: number;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @IsOptional()
  @IsUUID()
  linkedAccountId?: string;
}

export class UpdateGoalDto implements UpdateGoalPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ValidateIf((dto: UpdateGoalDto) => dto.linkedAccountId !== null)
  @IsOptional()
  @IsUUID()
  linkedAccountId?: string | null;
}

export class CreateGoalContributionDto implements CreateGoalContributionPayload {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;
}
