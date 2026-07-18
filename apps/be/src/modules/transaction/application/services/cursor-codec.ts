import { BadRequestException } from '@nestjs/common';

import { type TransactionCursor } from '@/modules/transaction/application/interfaces/transaction-repo.interface';

export class CursorCodec {
  static encode(cursor: TransactionCursor): string {
    return Buffer.from(
      JSON.stringify({ o: cursor.occurredAt.toISOString(), id: cursor.id }),
    ).toString('base64url');
  }

  static decode(raw: string): TransactionCursor {
    try {
      const parsed = JSON.parse(
        Buffer.from(raw, 'base64url').toString('utf8'),
      ) as { o: string; id: string };
      const occurredAt = new Date(parsed.o);
      if (Number.isNaN(occurredAt.getTime()) || !parsed.id) {
        throw new Error('Malformed cursor');
      }
      return { occurredAt, id: parsed.id };
    } catch {
      throw new BadRequestException('Invalid pagination cursor');
    }
  }
}
