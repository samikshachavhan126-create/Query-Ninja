import { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  Plus,
  MessageSquareText,
  ClockAlert,
  Bot,
  CalendarClock,
  ChevronDown,
  Check,
  UserCheck,
  GraduationCap,
  Award,
} from 'lucide-react';
import { NavTab, Persona, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalDoubtsCount: number;
  unresolvedCount: number;
  personas: Persona[];
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function TopNav({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  totalDoubtsCount,
  unresolvedCount,
  personas,
  activeRole,
  onRoleChange,
  isDarkMode,
  onToggleTheme,
}: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  const currentPersona = personas.find((p) => p.id === activeRole) ?? personas[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getRoleIcon = (role: UserRole) => {
    if (role === 'asker')
      return <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    if (role === 'peer')
      return <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    return <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand + Global Search + Theme Switch + Instant Role Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Left: Brand Logo + Live Search */}
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <button
              type="button"
              onClick={() => onSelectTab('feed')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg shrink-0"
            >
              <BrandLogo size="md" />
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                Query Ninja
              </span>
            </button>

            {/* Live Global Search Bar */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search doubts, C syntax, pointers, sorting..."
                aria-label="Search doubts by keyword, subject, or topic"
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Theme Switch + Instant Role Switcher Pill Dropdown */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />

            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                className="inline-flex items-center gap-2.5 pl-3 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {getRoleIcon(currentPersona.id)}
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentPersona.shortName}
                  </span>
                  <span className="hidden sm:inline text-slate-400 dark:text-slate-500">·</span>
                  <span className="hidden sm:inline text-xs font-medium text-slate-600 dark:text-slate-300">
                    {currentPersona.roleTitle}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-150 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Switch demo persona"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Live Persona Switcher
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Switch viewpoints anytime to preview asker, solver, and faculty controls.
                    </p>
                  </div>

                  <div className="space-y-1">
                    {personas.map((persona) => {
                      const isSelected = persona.id === activeRole;
                      return (
                        <button
                          key={persona.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onRoleChange(persona.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-slate-900 dark:text-slate-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5">{getRoleIcon(persona.id)}</div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {persona.dropdownLabel}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {persona.metaText}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                {persona.permissionSummary}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search doubts, subjects, or topics..."
              aria-label="Search doubts"
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center / Sub-nav: 5 Navigation Tabs */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center justify-between gap-3 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto thin-scrollbar"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('feed')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'feed'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquareText className="w-4 h-4 shrink-0" />
              <span>Doubt Feed</span>
              <span
                className={`px-1.5 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                  activeTab === 'feed'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {totalDoubtsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('unresolved')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'unresolved'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <ClockAlert className="w-4 h-4 shrink-0" />
              <span>Unresolved Tracker</span>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-rose-600 text-white tabular-nums">
                {unresolvedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('ai_friend')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ai_friend'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>AI Friend (24×7)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('ratraa')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ratraa'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarClock className="w-4 h-4 shrink-0" />
              <span>Ratraa Planner</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('ask')}
            title={`Ask a Doubt (${shortcutLabel})`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs ${
              activeTab === 'ask'
                ? 'bg-indigo-700 text-white ring-2 ring-indigo-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Ask a Doubt</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[11px] font-mono font-medium text-indigo-50 leading-none">
              {shortcutLabel}
            </kbd>
          </button>
        </nav>
      </div>
    </header>
  );
}
