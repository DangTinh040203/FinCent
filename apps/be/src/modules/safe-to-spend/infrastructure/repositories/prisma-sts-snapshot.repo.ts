import { Injectable } from '@nestjs/common';
import { type SafeToSpendDto } from '@repo/shared';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type IStsSnapshotRepository } from '@/modules/safe-to-spend/application/interfaces/sts-snapshot-repo.interface';

@Injectable()
export class PrismaStsSnapshotRepository implements IStsSnapshotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, snapshot: SafeToSpendDto): Promise<void> {
    await this.prisma.safeToSpendSnapshot.create({
      data: {
        userId,
        amount: BigInt(snapshot.amount),
        currency: snapshot.currency,
        computedAt: new Date(snapshot.computedAt),
        breakdown: JSON.parse(JSON.stringify(snapshot)),
      },
    });
  }
}
