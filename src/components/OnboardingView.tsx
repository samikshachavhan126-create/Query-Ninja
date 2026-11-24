import { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Award,
  GraduationCap,
  Check,
  CheckCircle2,
  Bot,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Ban,
  SendToBack,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Persona, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface OnboardingViewProps {
  personas: Persona[];
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onGetStarted: () => void;
  totalDoubtsCount: number;
  unresolvedCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const ROLE_HIGHLIGHTS: Record<
  UserRole,
  { tag: string; sampleAction: string }
> = {
  asker: {
    tag: 'Ask & Accept',
    sampleAction:
      'Raise new doubts with live duplicate scanning and crown Peer-Accepted walkthroughs.',
  },
  peer: {
    tag: 'Solve & Mentor',
    sampleAction:
      'Dive into 14-hour open questions, share C/DSA snippets, and climb the solver ranks.',
  },
  teacher: {
    tag: 'Verify & Moderate',
    sampleAction:
      'Award Teacher-Verified shields, pin faculty notes, and collapse misleading replies.',
  },
};

interface TourSlide {
  id: 'peer' | 'teacher' | 'ai';
  stepLabel: string;
  tabLabel: string;
  title: string;
  description: string;
  keyPoint: string;
}

const TOUR_SLIDES: TourSlide[] = [
  {
    id: 'peer',
    stepLabel: '01 / 03',
    tabLabel: 'Peer-Accepted',
    title: 'Intuitive breakthroughs crowned Peer-Accepted',
    description:
      'Seasoned peers break down gnarly lab bugs in plain, approachable language. Once a walkthrough genuinely clicks, the asker marks it Peer-Accepted—signaling to the entire batch what actually works.',
    keyPoint: 'Independent of faculty sign-off — celebrates clarity and rapid peer mentorship.',
  },
  {
    id: 'teacher',
    stepLabel: '02 / 03',
    tabLabel: 'Teacher-Verified',
    title: 'Academic rigor backed by Teacher-Verified shields',
    description:
      'Faculty review peer threads, award an official Teacher-Verified shield with a concise Faculty Note, and collapse flawed replies so misinformation never derails exam prep.',
    keyPoint: 'Dual-tier trust guarantees both student readability and syllabus-grade accuracy.',
  },
  {
    id: 'ai',
    stepLabel: '03 / 03',
    tabLabel: 'AI Friend (24×7)',
    title: '24×7 AI Study Friend anchored in campus truth',
    description:
      'Debugging at 2:00 AM before an 8:00 AM lab? AI Friend draws answers strictly from Peer-Accepted and Teacher-Verified campus threads—and routes uncharted questions straight to the Unresolved Tracker.',
    keyPoint: 'Zero-hallucination campus grounding with one-click faculty escalation.',
  },
];

export function OnboardingView({
  personas,
  selectedRole,
  onSelectRole,
  onGetStarted,
  totalDoubtsCount,
  unresolvedCount,
  isDarkMode,
  onToggleTheme,
}: OnboardingViewProps) {
  const [tourIndex, setTourIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const risingBlurProps = (delay: number) =>
    shouldReduceMotion
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.2, delay: delay * 0.4 },
        }
      : {
          initial: { opacity: 0, y: 28, filter: 'blur(14px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: {
            duration: 0.58,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  const activePersona =
    personas.find((p) => p.id === selectedRole) ?? personas[0];
  const currentSlide = TOUR_SLIDES[tourIndex];

  const handlePrevSlide = () => {
    setTourIndex((prev) => (prev === 0 ? TOUR_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setTourIndex((prev) => (prev === TOUR_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const getRoleIcon = (role: UserRole, isSelected: boolean) => {
    const colorClass = isSelected
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-slate-600 dark:text-slate-300';
    if (role === 'asker') return <UserCheck className={`w-5 h-5 ${colorClass}`} />;
    if (role === 'peer') return <Award className={`w-5 h-5 ${colorClass}`} />;
    return <GraduationCap className={`w-5 h-5 ${colorClass}`} />;
  };

  const renderSlidePreview = (slideId: TourSlide['id']) => {
    if (slideId === 'peer') {
      return (
        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Priya Deshmukh
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                2nd Year • Top Solver
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Peer-Accepted
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            &ldquo;Adding a leading space before{' '}
            <code className="font-mono text-indigo-700 dark:text-indigo-300">%c</code> tells{' '}
            <code className="font-mono text-indigo-700 dark:text-indigo-300">scanf</code> to
            consume the leftover newline in{' '}
            <code className="font-mono text-indigo-700 dark:text-indigo-300">stdin</code>.&rdquo;
          </p>

          <pre className="p-3 rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
            <code>{`scanf("%d", &choice);\nscanf(" %c", &ch); // Skips leftover '\\n'`}</code>
          </pre>

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white">
              <ThumbsUp className="w-3 h-3" />
              Helpful (14)
            </span>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Accepted by Asker ✓
            </span>
          </div>
        </div>
      );
    }

    if (slideId === 'teacher') {
      return (
        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Prof. R. K. Kulkarni · Faculty Review
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Teacher-Verified
            </span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 space-y-1">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Faculty Note
            </p>
            <p className="text-xs text-blue-950 dark:text-blue-100">
              Verified: Accurate explanation of heap zero-initialization in{' '}
              <code className="font-mono">calloc()</code> vs{' '}
              <code className="font-mono">malloc()</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
            <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              Flawed Turbo-C claim collapsed by Moderator to protect syllabus accuracy.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex justify-end">
          <div className="px-3.5 py-2 rounded-xl rounded-br-sm bg-indigo-600 text-white text-xs font-medium">
            Why does scanf skip my char input?
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl rounded-tl-sm p-3.5 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80">
              <ShieldCheck className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              Teacher-Verified Source
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80">
              <CheckCircle2 className="w-3 h-3" />
              Peer-Accepted
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Matched campus thread: Use{' '}
            <code className="font-mono text-indigo-700 dark:text-indigo-300">&quot; %c&quot;</code>{' '}
            to ignore the leftover newline in <code className="font-mono">stdin</code>.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <SendToBack className="w-3.5 h-3.5" />
            Uncharted questions route straight to Faculty Queue
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="onboarding-screen"
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 16, filter: 'blur(10px)' }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: 'blur(0px)' }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -12, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors"
    >
      {/* Top Minimal Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="md" />
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Query Ninja
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={onGetStarted}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              Enter Doubt Feed →
            </button>
          </div>
        </div>
      </header>

      {/* Main Onboarding Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Welcome Hero Header */}
        <motion.section {...risingBlurProps(0.05)} className="max-w-3xl space-y-4">
          <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
            Campus Peer Learning · Faculty-Moderated Q&amp;A
          </p>

          <h1
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Where tough doubts get verified—never buried.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Query Ninja keeps engineering Q&amp;A swift, rigorous, and clutter-free.
            Surface existing walkthroughs before posting, distinguish peer clarity from
            faculty sign-off, and ensure no open question slips into the void.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {totalDoubtsCount}
              </strong>{' '}
              live campus threads
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-rose-600 dark:text-rose-400">
                {unresolvedCount}
              </strong>{' '}
              awaiting resolution
            </span>
            <span aria-hidden="true">·</span>
            <span>Dual-tier Peer &amp; Faculty trust</span>
          </div>
        </motion.section>

        {/* Quick Platform Tour (3-Step Interactive Carousel) */}
        <motion.section
          {...risingBlurProps(0.14)}
          aria-label="Quick Platform Tour"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 sm:p-7 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Quick Platform Tour
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                See how every thread balances student speed with academic precision before jumping in.
              </p>
            </div>

            {/* Step Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
              {TOUR_SLIDES.map((slide, idx) => {
                const isActive = idx === tourIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setTourIndex(idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {slide.id === 'peer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {slide.id === 'teacher' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {slide.id === 'ai' && <Bot className="w-3.5 h-3.5" />}
                    <span>{slide.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel Slide Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-6 space-y-3">
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  Feature {currentSlide.stepLabel} · {currentSlide.tabLabel}
                </span>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentSlide.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentSlide.description}
                </p>

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                  {currentSlide.keyPoint}
                </p>
              </div>

              <div className="lg:col-span-6">{renderSlidePreview(currentSlide.id)}</div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {TOUR_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setTourIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.tabLabel}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === tourIndex
                      ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous tour slide"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next tour slide"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Interactive Persona Selection */}
        <motion.section
          {...risingBlurProps(0.24)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Choose your vantage point
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Step into a campus persona to experience its live permissions—you can
                switch roles anytime from the header.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Active role:{' '}
              <strong className="text-indigo-700 dark:text-indigo-400">
                {activePersona.shortName}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personas.map((persona) => {
              const isSelected = persona.id === selectedRole;
              const info = ROLE_HIGHLIGHTS[persona.id];

              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onSelectRole(persona.id)}
                  aria-pressed={isSelected}
                  className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600/20 dark:ring-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                        {getRoleIcon(persona.id, isSelected)}
                      </span>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {info.tag}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                        {persona.fullName}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {persona.roleTitle} · {persona.metaText}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {info.sampleAction}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Stepping in as{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {activePersona.postingIdentityLabel}
              </strong>
            </p>

            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <span>Get Started as {activePersona.shortName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
}
