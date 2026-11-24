import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface OpeningIntroProps {
  onComplete: () => void;
}

export function OpeningIntro({ onComplete }: OpeningIntroProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const durationMs = shouldReduceMotion ? 450 : 1850;
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [onComplete, shouldReduceMotion]);

  return (
    <motion.div
      key="opening-intro"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : -18,
        filter: shouldReduceMotion ? 'none' : 'blur(12px)',
      }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 overflow-hidden select-none"
    >
      {/* Subtle Ambient Glow Backdrop */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-3xl"
      />

      {/* Center Stage: Rising Blur Reveal of Logo + Wordmark */}
      <div className="relative flex flex-col items-center text-center">
        {/* Logo Emblem */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 32, scale: 0.88, filter: 'blur(18px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="p-1.5 rounded-[1.75rem] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent shadow-xl shadow-indigo-500/10 dark:shadow-indigo-950/60">
            <BrandLogo size="xl" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 24, filter: 'blur(14px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Query Ninja
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 18, filter: 'blur(10px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400"
        >
          Peer-Powered · Faculty-Verified Doubt Hub
        </motion.p>

        {/* Progress Sweep Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="mt-7 w-44 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.35 : 1.25,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: 'left' }}
            className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600"
          />
        </motion.div>
      </div>

      {/* Subtle Skip Control */}
      <motion.button
        type="button"
        onClick={onComplete}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-10 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        Skip intro →
      </motion.button>
    </motion.div>
  );
}
