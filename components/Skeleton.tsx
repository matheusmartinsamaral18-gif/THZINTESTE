import React from 'react';

// Define prop interface for SkeletonCard to resolve 'key' and prop-type mismatch errors in JSX mappings
interface SkeletonCardProps {
  isChannel?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ isChannel = false }) => (
  <div className={`relative flex-none ${isChannel ? 'w-56 md:w-72' : 'w-[30vw] md:w-52'} animate-pulse`}>
    <div className={`relative ${isChannel ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden rounded-xl md:rounded-[1.5rem] bg-zinc-900/50 border border-white/5`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    </div>
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="py-4 md:py-8">
    <div className="px-6 md:px-16 mb-6 flex items-center gap-3">
      <div className="w-1.5 h-6 bg-zinc-800 rounded-full"></div>
      <div className="w-48 h-6 bg-zinc-800 rounded-md"></div>
    </div>
    <div className="flex overflow-x-auto px-6 md:px-16 gap-4 md:gap-6 no-scrollbar">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-10">
    {[...Array(20)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonHero: React.FC = () => (
  <div className="relative w-full h-[88vh] md:h-[95vh] bg-zinc-900/30 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
    <div className="absolute bottom-32 left-6 md:left-16 space-y-4 w-full max-w-2xl">
      <div className="w-24 h-5 bg-zinc-800 rounded"></div>
      <div className="w-full h-16 md:h-24 bg-zinc-800 rounded-2xl"></div>
      <div className="w-2/3 h-4 bg-zinc-800 rounded"></div>
      <div className="w-40 h-12 bg-zinc-800 rounded-xl"></div>
    </div>
  </div>
);

