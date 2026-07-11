'use client';

import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' aria-label='Toggle theme'>
          <Sun className={`
            h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all
            dark:scale-0 dark:-rotate-90
          `} />
          <Moon className={`
            absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all
            dark:scale-100 dark:rotate-0
          `} />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className='mr-2 h-4 w-4' />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className='mr-2 h-4 w-4' />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
