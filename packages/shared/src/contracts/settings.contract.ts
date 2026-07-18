import { type OnboardingStep } from '../enums/onboarding.enum';

export interface UserSettingsDto {
  displayCurrency: string;
  safetyBuffer: number;
  cycleStartDay: number;
  aiConsent: boolean;
}

export interface UpdateUserSettingsPayload {
  displayCurrency?: string;
  safetyBuffer?: number;
  cycleStartDay?: number;
  aiConsent?: boolean;
}

export interface OnboardingStateDto {
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  isCompleted: boolean;
}

export interface UpdateOnboardingStatePayload {
  completeStep?: OnboardingStep;
  skipStep?: OnboardingStep;
  finish?: boolean;
}
