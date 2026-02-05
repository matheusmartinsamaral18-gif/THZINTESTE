import React, { useState, useEffect } from 'react';
import MovieRow from '../MovieRow';
import { tmdbService } from '../../services/tmdbService';

interface FiccaoTabProps {
  onItemClick: (item: any) => void;
}

const FiccaoTab: React.FC<FiccaoTabProps> = ({ onItemClick }) => {
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const movie = await tmdbService.getMovieDetails(299534);
        if (movie && movie.poster_path) {
          setMovies([movie]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  return (
    <div className="px-4 md:px-12 py-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-10 w-1 bg-rose-600 rounded-full"></div>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
          CATÁLOGO <span className="text-rose-600">FICÇÃO CIENTÍFICA</span>
        </h1>
      </div>
      {movies.length > 0 ? (
        <div className="space-y-8">
          <MovieRow title="Filmes de Ficção" movies={movies} onMovieSelect={onItemClick} />
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default FiccaoTab;