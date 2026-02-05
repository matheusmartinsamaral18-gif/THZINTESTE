
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import MovieCard from '../MovieCard';
import { tmdbService } from '../../services/tmdbService';
import { SkeletonGrid } from '../Skeleton';

interface MoviesTabProps {
  onItemClick: (item: any) => void;
}

const GENRES = [
  { name: 'Todos', id: 'all' },
  { name: 'Ação', id: 28 },
  { name: 'Comédia', id: 35 },
  { name: 'Romance', id: 10749 },
  { name: 'Drama', id: 18 },
  { name: 'Terror', id: 27 },
  { name: 'Suspense', id: 53 },
  { name: 'Ficção Científica', id: 878 },
  { name: 'Fantasia', id: 14 },
  { name: 'Aventura', id: 12 },
  { name: 'Animação', id: 16 },
  { name: 'Nacional', id: 'BR' }
];

const MoviesTab: React.FC<MoviesTabProps> = ({ onItemClick }) => {
  const [selectedGenre, setSelectedGenre] = useState<any>(GENRES[0]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        let results: Movie[] = [];
        const startApiPage = ((currentPage - 1) * 4) + 1;
        
        const fetchBatch = async (start: number) => {
          const promises = [
            selectedGenre.id === 'all' ? tmdbService.getPopular(start) : tmdbService.getMoviesByGenre(selectedGenre.id, start),
            selectedGenre.id === 'all' ? tmdbService.getPopular(start + 1) : tmdbService.getMoviesByGenre(selectedGenre.id, start + 1),
            selectedGenre.id === 'all' ? tmdbService.getPopular(start + 2) : tmdbService.getMoviesByGenre(selectedGenre.id, start + 2),
            selectedGenre.id === 'all' ? tmdbService.getPopular(start + 3) : tmdbService.getMoviesByGenre(selectedGenre.id, start + 3),
          ];
          const responses = await Promise.all(promises);
          return responses.flat();
        };

        const batch = await fetchBatch(startApiPage);
        const seen = new Set();
        results = batch.filter(m => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return m.poster_path;
        }).slice(0, itemsPerPage);

        setMovies(results);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedGenre, currentPage]);

  const handleGenreChange = (genre: any) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-rose-600 rounded-full"></div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              CATÁLOGO <span className="text-rose-600">FILMES</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar pb-2">
            {GENRES.map((genre) => (
              <button
                key={genre.name}
                onClick={() => handleGenreChange(genre)}
                className={`flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedGenre.name === genre.name 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-white hover:border-white/20'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                {selectedGenre.name} — PÁGINA {currentPage}
              </p>
              <div className="h-[1px] flex-1 mx-8 bg-white/5 hidden md:block"></div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-6 md:gap-y-10">
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id}
                  movie={movie} 
                  onClick={onItemClick} 
                />
              ))}
            </div>

            <div className="mt-24 flex justify-center items-center gap-6 pb-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:border-rose-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-500">Pág {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white hover:border-rose-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesTab;
