import React, { useState, useEffect } from 'react';
import MovieCard from '../MovieCard';
import { tmdbService } from '../../services/tmdbService';

interface TerrorTabProps {
  onItemClick: (item: any) => void;
}

const TerrorTab: React.FC<TerrorTabProps> = ({ onItemClick }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await tmdbService.getMoviesByGenre(27, 1);
        setMovies(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="px-4 md:px-12 py-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-10 w-1 bg-rose-600 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.8)]"></div>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
          CATÁLOGO <span className="text-rose-600">TERROR</span>
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-12 h-12 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-8">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TerrorTab;