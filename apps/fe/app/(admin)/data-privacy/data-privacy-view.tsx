'use client';

import { formatDateTime } from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Switch } from '@repo/ui/components/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Download, FileJson } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useApi } from '@/components/providers/app-providers';
import {
  showApiError,
  useAuditTrail,
  useFinancialMutation,
  useProfile,
} from '@/libs/api/hooks';

const CSV_ENTITIES = [
  'transactions',
  'accounts',
  'categories',
  'budgets',
  'goals',
  'recurringRules',
] as const;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DataPrivacyView() {
  const api = useApi();
  const { data: profile } = useProfile();
  const { data: audit } = useAuditTrail();
  const [csvEntity, setCsvEntity] =
    useState<(typeof CSV_ENTITIES)[number]>('transactions');
  const [exporting, setExporting] = useState(false);

  const consentMutation = useFinancialMutation(
    async (aiConsent: boolean) => api.users.updateSettings({ aiConsent }),
    { successMessage: 'Preference saved' },
  );

  const exportJson = async () => {
    setExporting(true);
    try {
      downloadBlob(await api.privacy.exportJson(), 'fincent-export.json');
      toast.success('Export downloaded');
    } catch (error) {
      showApiError(error);
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      downloadBlob(
        await api.privacy.exportCsv(csvEntity),
        `fincent-${csvEntity}.csv`,
      );
      toast.success('Export downloaded');
    } catch (error) {
      showApiError(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Your data belongs to you</CardTitle>
          <CardDescription>
            Export everything at any time. Deleting your account removes all
            data permanently.
          </CardDescription>
        </CardHeader>
        <CardContent
          className={`
            flex flex-col gap-3
            sm:flex-row sm:items-center
          `}
        >
          <Button onClick={exportJson} disabled={exporting}>
            <FileJson className='size-4' />
            Export everything (JSON)
          </Button>
          <div className='flex items-center gap-2'>
            <Select
              value={csvEntity}
              onValueChange={(value) =>
                setCsvEntity(value as (typeof CSV_ENTITIES)[number])
              }
            >
              <SelectTrigger className='w-44'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CSV_ENTITIES.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={exportCsv} disabled={exporting}>
              <Download className='size-4' />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI data usage</CardTitle>
          <CardDescription>
            When off, none of your data is ever sent to an AI provider. AI
            features simply switch off — everything else keeps working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-3'>
            <Switch
              id='ai-consent'
              checked={profile?.settings.aiConsent ?? false}
              onCheckedChange={(checked) => consentMutation.mutate(checked)}
            />
            <Label htmlFor='ai-consent'>
              Allow AI features to process my financial data
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Important changes — balance edits, deletions and exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(audit ?? []).length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No audited actions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(audit ?? []).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className='whitespace-nowrap'>
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {entry.entity}
                    </TableCell>
                    <TableCell
                      className={`
                        text-muted-foreground max-w-64 truncate font-mono
                        text-xs
                      `}
                    >
                      {entry.detail}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
