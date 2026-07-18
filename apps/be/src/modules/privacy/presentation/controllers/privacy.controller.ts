import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { type AuditLogDto, type DataExportDto } from '@repo/shared';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { type Response } from 'express';

import { CurrentDbUser } from '@/libs/decorators';
import { PrivacyService } from '@/modules/privacy/application/services/privacy.service';
import { User } from '@/modules/user/domain';

class AuditQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('export')
  @Header('Content-Disposition', 'attachment; filename="fincent-export.json"')
  async exportJson(@CurrentDbUser() user: User): Promise<DataExportDto> {
    return this.privacyService.exportJson(user);
  }

  @Get('export/csv/:entity')
  async exportCsv(
    @CurrentDbUser() user: User,
    @Param('entity') entity: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const csv = await this.privacyService.exportCsv(user, entity);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fincent-${entity}.csv"`,
    );
    return csv;
  }

  @Get('audit')
  async audit(
    @CurrentDbUser() user: User,
    @Query() query: AuditQueryDto,
  ): Promise<AuditLogDto[]> {
    return this.privacyService.auditTrail(user, query.limit ?? 50);
  }
}
