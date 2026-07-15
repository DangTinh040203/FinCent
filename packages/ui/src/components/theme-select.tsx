'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Select value={mounted ? theme : undefined} onValueChange={setTheme}>
      <SelectTrigger size='sm' aria-label='Select theme' className='w-32'>
        <SelectValue placeholder='Theme' />
      </SelectTrigger>
      <SelectContent align='end'>
        {THEME_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <option.icon />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
