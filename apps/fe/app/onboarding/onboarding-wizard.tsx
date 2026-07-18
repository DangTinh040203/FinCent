'use client';

import {
  AccountType,
  CategoryType,
  formatMoney,
  OnboardingStep,
  RecurringCadence,
  SUPPORTED_CURRENCIES,
  toDateInputValue,
  toMinorUnits,
} from '@repo/shared';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Progress } from '@repo/ui/components/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Money } from '@/components/finance/money';
import { useApi } from '@/components/providers/app-providers';
import {
  showApiError,
  useAccounts,
  useCategories,
  useInvalidateFinancials,
  useProfile,
  useRecurringRules,
  useSafeToSpend,
} from '@/libs/api/hooks';

const STEP_ORDER = [
  OnboardingStep.PREFERENCES,
  OnboardingStep.ACCOUNTS,
  OnboardingStep.RECURRING,
  OnboardingStep.GOAL,
] as const;

const STEP_TITLES: Record<OnboardingStep, string> = {
  [OnboardingStep.PREFERENCES]: 'Basics',
  [OnboardingStep.ACCOUNTS]: 'Your accounts',
  [OnboardingStep.RECURRING]: 'Income & bills',
  [OnboardingStep.GOAL]: 'One goal',
};

export function OnboardingWizard() {
  const api = useApi();
  const router = useRouter();
  const invalidate = useInvalidateFinancials();
  const { data: profile } = useProfile();

  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const resolvedIndex = useMemo(() => {
    if (stepIndex !== null) {
      return stepIndex;
    }
    if (!profile) {
      return 0;
    }
    const touched = new Set([
      ...profile.onboarding.completedSteps,
      ...profile.onboarding.skippedSteps,
    ]);
    const firstOpen = STEP_ORDER.findIndex((step) => !touched.has(step));
    return firstOpen === -1 ? STEP_ORDER.length : firstOpen;
  }, [stepIndex, profile]);

  const currentStep =
    resolvedIndex < STEP_ORDER.length ? STEP_ORDER[resolvedIndex] : null;

  const advance = async (
    action: 'complete' | 'skip',
    step: OnboardingStep,
  ) => {
    setBusy(true);
    try {
      await api.users.updateOnboarding(
        action === 'complete' ? { completeStep: step } : { skipStep: step },
      );
      await invalidate();
      setStepIndex(resolvedIndex + 1);
    } catch (error) {
      showApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      await api.users.updateOnboarding({ finish: true });
      await invalidate();
      toast.success('Welcome to FinCent!');
      router.push('/dashboard');
    } catch (error) {
      showApiError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <h1 className='font-display text-2xl font-semibold'>
          Welcome to FinCent
        </h1>
        <p className='text-muted-foreground text-sm'>
          Five minutes of setup for a real Safe-to-Spend number. Every step is
          skippable — you can finish later from Settings.
        </p>
        <Progress
          value={(resolvedIndex / STEP_ORDER.length) * 100}
          className='h-1.5'
        />
        <div className='flex gap-2'>
          {STEP_ORDER.map((step, index) => (
            <Badge
              key={step}
              variant={index === resolvedIndex ? 'default' : 'outline'}
              className='text-[10px]'
            >
              {index < resolvedIndex && <Check className='size-3' />}
              {STEP_TITLES[step]}
            </Badge>
          ))}
        </div>
      </div>

      {currentStep === OnboardingStep.PREFERENCES && (
        <PreferencesStep
          busy={busy}
          onDone={(action) => advance(action, OnboardingStep.PREFERENCES)}
        />
      )}
      {currentStep === OnboardingStep.ACCOUNTS && (
        <AccountsStep
          busy={busy}
          onDone={(action) => advance(action, OnboardingStep.ACCOUNTS)}
        />
      )}
      {currentStep === OnboardingStep.RECURRING && (
        <RecurringStep
          busy={busy}
          onDone={(action) => advance(action, OnboardingStep.RECURRING)}
        />
      )}
      {currentStep === OnboardingStep.GOAL && (
        <GoalStep
          busy={busy}
          onDone={(action) => advance(action, OnboardingStep.GOAL)}
        />
      )}
      {currentStep === null && <DoneStep busy={busy} onFinish={finish} />}
    </div>
  );
}

interface StepProps {
  busy: boolean;
  onDone: (action: 'complete' | 'skip') => void;
}

function StepActions({
  busy,
  onDone,
  completeDisabled = false,
  completeLabel = 'Continue',
}: StepProps & { completeDisabled?: boolean; completeLabel?: string }) {
  return (
    <div className='flex justify-between pt-2'>
      <Button
        variant='ghost'
        disabled={busy}
        onClick={() => onDone('skip')}
      >
        Skip for now
      </Button>
      <Button
        disabled={busy || completeDisabled}
        onClick={() => onDone('complete')}
      >
        {completeLabel}
        <ArrowRight className='size-4' />
      </Button>
    </div>
  );
}

function PreferencesStep({ busy, onDone }: StepProps) {
  const api = useApi();
  const { data: profile } = useProfile();
  const invalidate = useInvalidateFinancials();

  const [currency, setCurrency] = useState(
    profile?.settings.displayCurrency ?? 'VND',
  );
  const [cycleStartDay, setCycleStartDay] = useState(
    String(profile?.settings.cycleStartDay ?? 1),
  );
  const [buffer, setBuffer] = useState('');

  const save = async () => {
    try {
      await api.users.updateSettings({
        displayCurrency: currency,
        cycleStartDay: Math.min(28, Math.max(1, Number(cycleStartDay) || 1)),
        safetyBuffer: buffer
          ? toMinorUnits(Number(buffer) || 0, currency)
          : undefined,
      });
      await invalidate();
      onDone('complete');
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basics</CardTitle>
        <CardDescription>
          Your currency and when your money month starts.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          className={`
            grid gap-4
            sm:grid-cols-3
          `}
        >
          <div className='space-y-1'>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label>Cycle start day</Label>
            <Input
              type='number'
              min={1}
              max={28}
              value={cycleStartDay}
              onChange={(event) => setCycleStartDay(event.target.value)}
            />
          </div>
          <div className='space-y-1'>
            <Label>Safety buffer (optional)</Label>
            <Input
              type='number'
              min={0}
              step='any'
              placeholder='e.g. 500000'
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
        </div>
        <div className='flex justify-between pt-2'>
          <Button variant='ghost' disabled={busy} onClick={() => onDone('skip')}>
            Skip for now
          </Button>
          <Button disabled={busy} onClick={save}>
            Continue
            <ArrowRight className='size-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountsStep({ busy, onDone }: StepProps) {
  const api = useApi();
  const { data: accounts } = useAccounts();
  const { data: profile } = useProfile();
  const invalidate = useInvalidateFinancials();
  const currency = profile?.settings.displayCurrency ?? 'VND';

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.CASH);
  const [balance, setBalance] = useState('');
  const [adding, setAdding] = useState(false);

  const addAccount = async () => {
    if (!name.trim()) {
      return;
    }
    setAdding(true);
    try {
      await api.accounts.create({
        name: name.trim(),
        type,
        currency,
        openingBalance: toMinorUnits(Number(balance) || 0, currency),
      });
      await invalidate();
      setName('');
      setBalance('');
    } catch (error) {
      showApiError(error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where is your money?</CardTitle>
        <CardDescription>
          Add each place you keep money, with its current balance.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {(accounts ?? []).length > 0 && (
          <ul className='space-y-1 text-sm'>
            {(accounts ?? []).map((account) => (
              <li
                key={account.id}
                className='flex items-center justify-between'
              >
                <span>{account.name}</span>
                <Money
                  amount={account.currentBalance}
                  currency={account.currency}
                />
              </li>
            ))}
          </ul>
        )}
        <div
          className={`
            grid grid-cols-2 gap-2
            sm:grid-cols-4
          `}
        >
          <Input
            placeholder='Account name'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Select
            value={type}
            onValueChange={(value) => setType(value as AccountType)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AccountType.CASH}>Cash</SelectItem>
              <SelectItem value={AccountType.BANK}>Bank</SelectItem>
              <SelectItem value={AccountType.E_WALLET}>E-wallet</SelectItem>
              <SelectItem value={AccountType.CREDIT_CARD}>
                Credit card
              </SelectItem>
              <SelectItem value={AccountType.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type='number'
            min={0}
            step='any'
            placeholder={`Balance (${currency})`}
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
          />
          <Button
            variant='outline'
            onClick={addAccount}
            disabled={adding || !name.trim()}
          >
            Add
          </Button>
        </div>
        <StepActions
          busy={busy}
          onDone={onDone}
          completeDisabled={(accounts ?? []).length === 0}
        />
      </CardContent>
    </Card>
  );
}

function RecurringStep({ busy, onDone }: StepProps) {
  const api = useApi();
  const { data: rules } = useRecurringRules();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const invalidate = useInvalidateFinancials();

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryType.INCOME);
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(toDateInputValue(new Date()));
  const [adding, setAdding] = useState(false);

  const account = accounts?.[0];
  const currency = account?.currency ?? 'VND';

  const addRule = async () => {
    if (!account || !name.trim() || !amount) {
      return;
    }
    const category = (categories ?? []).find(
      (candidate) => candidate.type === type && !candidate.isArchived,
    );
    if (!category) {
      toast.error('No matching category found');
      return;
    }
    setAdding(true);
    try {
      await api.recurring.createRule({
        name: name.trim(),
        accountId: account.id,
        categoryId: category.id,
        type,
        amount: toMinorUnits(Number(amount) || 0, currency),
        cadence: RecurringCadence.MONTHLY,
        nextDueAt: new Date(`${dueDay}T09:00:00`).toISOString(),
        isEssential: type === CategoryType.EXPENSE,
      });
      await invalidate();
      setName('');
      setAmount('');
    } catch (error) {
      showApiError(error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What comes in and out every month?</CardTitle>
        <CardDescription>
          Your salary and fixed bills — these power projections and
          Safe-to-Spend. You can refine categories later.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {(rules ?? []).length > 0 && (
          <ul className='space-y-1 text-sm'>
            {(rules ?? []).map((rule) => (
              <li key={rule.id} className='flex items-center justify-between'>
                <span>
                  {rule.name}{' '}
                  <span className='text-muted-foreground text-xs'>
                    ({rule.type === CategoryType.INCOME ? 'income' : 'bill'})
                  </span>
                </span>
                <Money amount={rule.amount} currency={rule.currency} />
              </li>
            ))}
          </ul>
        )}
        {account ? (
          <div
            className={`
              grid grid-cols-2 gap-2
              sm:grid-cols-5
            `}
          >
            <Input
              placeholder='e.g. Salary, Rent'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Select
              value={type}
              onValueChange={(value) => setType(value as CategoryType)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CategoryType.INCOME}>Income</SelectItem>
                <SelectItem value={CategoryType.EXPENSE}>Bill</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type='number'
              min={0}
              step='any'
              placeholder={`Amount (${currency})`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Input
              type='date'
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
            />
            <Button
              variant='outline'
              onClick={addRule}
              disabled={adding || !name.trim() || !amount}
            >
              Add
            </Button>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Add an account in the previous step first, or skip for now.
          </p>
        )}
        <StepActions
          busy={busy}
          onDone={onDone}
          completeDisabled={(rules ?? []).length === 0}
        />
      </CardContent>
    </Card>
  );
}

function GoalStep({ busy, onDone }: StepProps) {
  const api = useApi();
  const { data: profile } = useProfile();
  const invalidate = useInvalidateFinancials();
  const currency = profile?.settings.displayCurrency ?? 'VND';

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const createAndContinue = async () => {
    if (!name.trim() || !target || !deadline) {
      return;
    }
    try {
      await api.goals.create({
        name: name.trim(),
        targetAmount: toMinorUnits(Number(target) || 0, currency),
        deadline: new Date(`${deadline}T00:00:00`).toISOString(),
      });
      await invalidate();
      onDone('complete');
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What are you saving for?</CardTitle>
        <CardDescription>
          One goal is enough to start — FinCent computes the monthly
          contribution and protects it in Safe-to-Spend.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          className={`
            grid gap-2
            sm:grid-cols-3
          `}
        >
          <Input
            placeholder='e.g. Emergency fund'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            type='number'
            min={0}
            step='any'
            placeholder={`Target (${currency})`}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          />
          <Input
            type='date'
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </div>
        <div className='flex justify-between pt-2'>
          <Button variant='ghost' disabled={busy} onClick={() => onDone('skip')}>
            Skip for now
          </Button>
          <Button
            disabled={busy || !name.trim() || !target || !deadline}
            onClick={createAndContinue}
          >
            Create goal & continue
            <ArrowRight className='size-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DoneStep({ busy, onFinish }: { busy: boolean; onFinish: () => void }) {
  const { data: sts } = useSafeToSpend();

  return (
    <Card>
      <CardHeader>
        <CardTitle>You are set</CardTitle>
        <CardDescription>
          Here is your first Safe-to-Spend. It updates live with every
          transaction, bill and contribution.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {sts && (
          <div>
            <p className='text-muted-foreground text-xs uppercase'>
              Safe-to-Spend · {sts.period.label}
            </p>
            <p className='font-display text-4xl font-semibold tabular-nums'>
              {formatMoney(sts.amount, sts.currency)}
            </p>
            {sts.warnings.length > 0 && (
              <ul className='text-muted-foreground mt-2 space-y-1 text-xs'>
                {sts.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className='flex justify-between'>
          <Button variant='ghost' asChild>
            <Link href='/settings'>Review settings</Link>
          </Button>
          <Button disabled={busy} onClick={onFinish}>
            Go to dashboard
            <ArrowRight className='size-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
