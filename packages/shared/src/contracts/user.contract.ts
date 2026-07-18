import { type OnboardingStateDto, type UserSettingsDto } from './settings.contract';

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  fullName: string;
  settings: UserSettingsDto;
  onboarding: OnboardingStateDto;
}
