import { type SafeToSpendDto } from '@repo/shared';

export const STS_SNAPSHOT_REPOSITORY_TOKEN = Symbol(
  'STS_SNAPSHOT_REPOSITORY_TOKEN',
);

export interface IStsSnapshotRepository {
  create(userId: string, snapshot: SafeToSpendDto): Promise<void>;
}
