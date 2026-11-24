import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap shrink-0"
    >
      <span className="relative inline-flex items-center w-9 h-5 rounded-full bg-slate-300 dark:bg-indigo-600 transition-colors p-0.5 shrink-0">
        <span
          className={`w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center transition-transform duration-150 ${
            isDarkMode ? 'translate-x-4' : 'translate-x-0'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-2.5 h-2.5 text-indigo-600" />
          ) : (
            <Sun className="w-2.5 h-2.5 text-amber-500" />
          )}
        </span>
      </span>
      <span className="hidden sm:inline">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
