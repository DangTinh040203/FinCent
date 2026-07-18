import {
  type OnboardingStateDto,
  type UserSettingsDto,
} from '@repo/shared';

export class User {
  id: string;
  providerId: string;
  provider: string;
  email: string;

  firstName: string | null;
  lastName: string | null;
  avatar: string | null;

  displayCurrency: string;
  safetyBuffer: number;
  cycleStartDay: number;
  aiConsent: boolean;
  onboardingState: OnboardingStateDto | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || '';
  }

  get isProfileComplete(): boolean {
    return !!(this.firstName && this.lastName && this.avatar);
  }

  toSettingsDto(): UserSettingsDto {
    return {
      displayCurrency: this.displayCurrency,
      safetyBuffer: this.safetyBuffer,
      cycleStartDay: this.cycleStartDay,
      aiConsent: this.aiConsent,
    };
  }

  toOnboardingDto(): OnboardingStateDto {
    const state = this.onboardingState;
    return {
      completedSteps: Array.isArray(state?.completedSteps)
        ? state.completedSteps
        : [],
      skippedSteps: Array.isArray(state?.skippedSteps)
        ? state.skippedSteps
        : [],
      isCompleted: state?.isCompleted === true,
    };
  }
}
