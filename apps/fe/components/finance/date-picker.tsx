'use client';

import { formatDate, toDateInputValue } from '@repo/shared';
import { Button } from '@repo/ui/components/button';
import { Calendar } from '@repo/ui/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  allowClear = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const showClear = allowClear && selected && !disabled;

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected && 'text-muted-foreground',
              showClear && 'pr-8',
            )}
          >
            <CalendarIcon className='size-4' aria-hidden='true' />
            <span className='flex-1 truncate'>
              {selected ? formatDate(selected) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              onChange(date ? toDateInputValue(date) : '');
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {showClear && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label='Clear date'
          className={`absolute top-1/2 right-1 size-6 -translate-y-1/2`}
          onClick={() => onChange('')}
        >
          <X className='size-3.5' aria-hidden='true' />
        </Button>
      )}
    </div>
  );
}
