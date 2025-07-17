'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Quitar el foco del botón después de seleccionar
    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }, 100);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Sun className="size-5" />
      </Button>
    );
  }

  const getCurrentIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="size-5" />;
      case 'light':
        return <Sun className="size-5" />;
      case 'system':
        return <Monitor className="size-5" />;
      default:
        return <Sun className="size-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="hover:bg-accent focus-visible:ring-ring relative overflow-hidden transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="transition-transform duration-300 hover:scale-110">
            {getCurrentIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 size-4" />
          <span>Modo Claro</span>
          {theme === 'light' && <div className="bg-primary ml-auto h-2 w-2 rounded-full" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 size-4" />
          <span>Modo Oscuro</span>
          {theme === 'dark' && <div className="bg-primary ml-auto h-2 w-2 rounded-full" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 size-4" />
          <span>Sistema</span>
          {theme === 'system' && <div className="bg-primary ml-auto h-2 w-2 rounded-full" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
