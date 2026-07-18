import {
  OnboardingStep,
  SUPPORTED_CURRENCIES,
  type UpdateOnboardingStatePayload,
  type UpdateUserSettingsPayload,
} from '@repo/shared';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserSettingsDto implements UpdateUserSettingsPayload {
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  displayCurrency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  safetyBuffer?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  cycleStartDay?: number;

  @IsOptional()
  @IsBoolean()
  aiConsent?: boolean;
}

export class UpdateOnboardingStateDto implements UpdateOnboardingStatePayload {
  @IsOptional()
  @IsEnum(OnboardingStep)
  completeStep?: OnboardingStep;

  @IsOptional()
  @IsEnum(OnboardingStep)
  skipStep?: OnboardingStep;

  @IsOptional()
  @IsBoolean()
  finish?: boolean;
}
