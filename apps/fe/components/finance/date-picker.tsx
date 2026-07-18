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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className='size-4' />
          <span className='flex-1 truncate'>
            {selected ? formatDate(selected) : placeholder}
          </span>
          {allowClear && selected && (
            <X
              className={`
                text-muted-foreground size-4 shrink-0
                hover:text-foreground
              `}
              role='button'
              aria-label='Clear date'
              onClick={(event) => {
                event.stopPropagation();
                onChange('');
              }}
            />
          )}
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
  );
}
