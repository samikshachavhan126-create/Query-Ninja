import { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
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
}: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (role === 'asker') return <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />;
    if (role === 'peer') return <Award className="w-4 h-4 text-emerald-600 shrink-0" />;
    return <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand + Global Search + Instant Role Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Left: Brand Logo + Live Search */}
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <button
              type="button"
              onClick={() => onSelectTab('feed')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg shrink-0"
            >
              <span className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Query Ninja
              </span>
            </button>

            {/* Live Global Search Bar */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search doubts, C, pointers, sorting..."
                aria-label="Search doubts by keyword, subject, or topic"
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Instant Role Switcher Pill Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-2.5 pl-3 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {getRoleIcon(currentPersona.id)}
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-semibold text-slate-900">{currentPersona.shortName}</span>
                <span className="hidden sm:inline text-slate-400">·</span>
                <span className="hidden sm:inline text-xs font-medium text-slate-600">
                  {currentPersona.roleTitle}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="listbox"
                aria-label="Switch demo persona"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Instant Demo Role Switcher
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switch personas to preview asker, solver, and moderator permissions live.
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
                            ? 'bg-indigo-50/80 text-slate-900'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5">{getRoleIcon(persona.id)}</div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-900">
                                {persona.dropdownLabel}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              {persona.metaText}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {persona.permissionSummary}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search doubts, subjects, topics..."
              aria-label="Search doubts"
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center / Sub-nav: 5 Navigation Tabs */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center justify-between gap-3 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('feed')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'feed'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MessageSquareText className="w-4 h-4 shrink-0" />
              <span>Doubt Feed</span>
              <span
                className={`px-1.5 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                  activeTab === 'feed'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
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
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <CalendarClock className="w-4 h-4 shrink-0" />
              <span>Ratraa Planner</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('ask')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs ${
              activeTab === 'ask'
                ? 'bg-indigo-700 text-white ring-2 ring-indigo-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Ask a Doubt</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
