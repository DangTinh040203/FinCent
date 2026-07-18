import { Injectable } from '@nestjs/common';
import {
  type OnboardingStateDto,
  type UpdateUserSettingsPayload,
} from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type User as UserRow } from '@/libs/databases/prisma/generated/client';
import {
  type CreateUserCommand,
  type UpdateUserCommand,
} from '@/modules/user/application/commands';
import { type IUserRepository } from '@/modules/user/application/interfaces';
import { User } from '@/modules/user/domain';

@Injectable()
export class PrismaAdapterUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserCommand): Promise<User> {
    const user = await this.prisma.user.create({ data: payload });
    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { providerId } });
    return user ? this.toDomain(user) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async update(id: string, payload: UpdateUserCommand): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: payload,
    });
    return this.toDomain(user);
  }

  async updateSettings(
    id: string,
    payload: UpdateUserSettingsPayload,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(payload.displayCurrency !== undefined && {
          displayCurrency: payload.displayCurrency,
        }),
        ...(payload.safetyBuffer !== undefined && {
          safetyBuffer: BigInt(payload.safetyBuffer),
        }),
        ...(payload.cycleStartDay !== undefined && {
          cycleStartDay: payload.cycleStartDay,
        }),
        ...(payload.aiConsent !== undefined && {
          aiConsent: payload.aiConsent,
        }),
      },
    });
    return this.toDomain(user);
  }

  async updateOnboardingState(
    id: string,
    state: OnboardingStateDto,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { onboardingState: JSON.parse(JSON.stringify(state)) },
    });
    return this.toDomain(user);
  }

  private toDomain(row: UserRow): User {
    return new User({
      id: row.id,
      providerId: row.providerId,
      provider: row.provider,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      avatar: row.avatar,
      displayCurrency: row.displayCurrency,
      safetyBuffer: Number(row.safetyBuffer),
      cycleStartDay: row.cycleStartDay,
      aiConsent: row.aiConsent,
      onboardingState:
        (row.onboardingState as OnboardingStateDto | null) ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
