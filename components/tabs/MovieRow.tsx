
import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  showRanking?: boolean;
  isNewRow?: boolean;
}

const MovieRow: React.FC<MovieRowProps> = ({ 
  title, 
  movies, 
  onMovieSelect, 
  showRanking = false, 
  isNewRow = false
}) => {
  if (movies.length === 0) return null;

  return (
    <div className="py-6 md:py-10 group/row relative">
      <div className="px-6 md:px-16 mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-rose-600 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)]"></div>
        <h2 className="text-lg md:text-3xl font-black italic text-zinc-100 tracking-tight uppercase">
          {title}
        </h2>
      </div>
      
      {/* Espaçamento aumentado (gap-10) para posters não ficarem grudados */}
      <div className="flex overflow-x-auto pb-12 pt-2 px-6 md:px-16 custom-scrollbar no-scrollbar scroll-smooth gap-8 md:gap-14">
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`relative flex-none flex items-end ${showRanking ? 'pl-12 md:pl-24' : ''}`}
          >
            {showRanking && (
              <div className="absolute left-0 bottom-[-15px] z-10 select-none pointer-events-none flex items-end">
                <span 
                  className="text-[120px] md:text-[220px] font-black italic leading-[0.7] tracking-tighter" 
                  style={{ 
                    color: 'rgba(0,0,0,0.6)',
                    WebkitTextStroke: '2px rgba(255, 255, 255, 0.4)',
                    textShadow: '0 0 40px rgba(255,255,255,0.1)',
                    fontFamily: '"Inter", sans-serif',
                    transform: 'translateX(-20%)'
                  }}
                >
                  {index + 1}
                </span>
              </div>
            )}
            
            <div className="relative z-20">
              <MovieCard movie={movie} onClick={onMovieSelect} isNew={isNewRow} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
