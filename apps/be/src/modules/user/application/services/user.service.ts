import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type OnboardingStateDto,
  type UpdateOnboardingStatePayload,
  type UpdateUserSettingsPayload,
} from '@repo/shared';

import { CacheKeys, CacheService } from '@/libs/cache';
import {
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@/modules/user/application/interfaces';
import { User } from '@/modules/user/domain';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findByProviderId(providerId: string): Promise<User | null> {
    const cacheKey = CacheKeys.user.byProviderId(providerId);

    const cachedUser = await this.cacheService.get<User | null>(cacheKey);

    if (cachedUser) {
      return new User(cachedUser);
    }

    this.logger.debug(`Cache MISS for user: ${providerId}`);
    const user = await this.userRepository.findByProviderId(providerId);

    if (user) {
      await this.cacheService.set(cacheKey, user);
    } else {
      // Cache null to prevent cache penetration (1 min)
      await this.cacheService.set(cacheKey, null, 60 * 1000);
    }

    return user;
  }

  async updateSettings(
    user: User,
    payload: UpdateUserSettingsPayload,
  ): Promise<User> {
    const updated = await this.userRepository.updateSettings(user.id, payload);
    await this.invalidateUserCache(user.providerId);
    return updated;
  }

  async updateOnboarding(
    user: User,
    payload: UpdateOnboardingStatePayload,
  ): Promise<User> {
    const state = user.toOnboardingDto();
    const next: OnboardingStateDto = {
      completedSteps: [...state.completedSteps],
      skippedSteps: [...state.skippedSteps],
      isCompleted: state.isCompleted || payload.finish === true,
    };

    if (
      payload.completeStep &&
      !next.completedSteps.includes(payload.completeStep)
    ) {
      next.completedSteps.push(payload.completeStep);
      next.skippedSteps = next.skippedSteps.filter(
        (step) => step !== payload.completeStep,
      );
    }

    if (
      payload.skipStep &&
      !next.completedSteps.includes(payload.skipStep) &&
      !next.skippedSteps.includes(payload.skipStep)
    ) {
      next.skippedSteps.push(payload.skipStep);
    }

    const updated = await this.userRepository.updateOnboardingState(
      user.id,
      next,
    );
    await this.invalidateUserCache(user.providerId);
    return updated;
  }

  async invalidateUserCache(providerId: string): Promise<void> {
    const cacheKey = CacheKeys.user.byProviderId(providerId);
    await this.cacheService.del(cacheKey);
    this.logger.debug(`Cache invalidated for user: ${providerId}`);
  }
}
