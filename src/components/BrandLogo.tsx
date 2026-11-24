import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
};

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <span
      className={`${SIZE_CLASSES[size]} bg-black border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-xs shrink-0`}
    >
      {imgError ? (
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
      ) : (
        <img
          src="/assets/aistudio/IMG_9314_955fdc89.PNG"
          alt="Query Ninja logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover scale-110"
        />
      )}
    </span>
  );
}
