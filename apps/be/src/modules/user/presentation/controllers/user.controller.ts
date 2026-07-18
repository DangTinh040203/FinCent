import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  type OnboardingStateDto,
  type UserProfileDto,
  type UserSettingsDto,
} from '@repo/shared';
import { type Request } from 'express';

import { CurrentDbUser, Public } from '@/libs/decorators';
import { ClerkWebhookService } from '@/modules/user/application/services';
import { UserService } from '@/modules/user/application/services/user.service';
import { User } from '@/modules/user/domain';
import {
  UpdateOnboardingStateDto,
  UpdateUserSettingsDto,
} from '@/modules/user/presentation/DTOs/user-settings.dto';
import { ClerkWebhookGuard } from '@/modules/user/presentation/guards/clerk-webhook.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly clerkWebhookService: ClerkWebhookService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @UseGuards(ClerkWebhookGuard)
  @Post('clerk')
  async handleClerkWebhook(@Req() req: Request) {
    this.logger.log(`Clerk webhook received: ${req.clerkEvent?.type}`);
    await this.clerkWebhookService.processWebhook(req.clerkEvent);
  }

  @Get('me')
  getMe(@CurrentDbUser() user: User): UserProfileDto {
    return this.toProfileDto(user);
  }

  @Patch('me/settings')
  async updateSettings(
    @CurrentDbUser() user: User,
    @Body() dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    const updated = await this.userService.updateSettings(user, dto);
    return updated.toSettingsDto();
  }

  @Get('me/onboarding')
  getOnboarding(@CurrentDbUser() user: User): OnboardingStateDto {
    return user.toOnboardingDto();
  }

  @Patch('me/onboarding')
  async updateOnboarding(
    @CurrentDbUser() user: User,
    @Body() dto: UpdateOnboardingStateDto,
  ): Promise<OnboardingStateDto> {
    const updated = await this.userService.updateOnboarding(user, dto);
    return updated.toOnboardingDto();
  }

  private toProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      fullName: user.fullName,
      settings: user.toSettingsDto(),
      onboarding: user.toOnboardingDto(),
    };
  }
}
