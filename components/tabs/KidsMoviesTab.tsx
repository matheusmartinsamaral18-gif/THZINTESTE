
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import MovieCard from '../MovieCard';
import { tmdbService } from '../../services/tmdbService';

interface KidsMoviesTabProps {
  onItemClick: (item: any) => void;
}

const KidsMoviesTab: React.FC<KidsMoviesTabProps> = ({ onItemClick }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  useEffect(() => {
    const loadKidsMovies = async () => {
      setLoading(true);
      try {
        const startApiPage = ((currentPage - 1) * 4) + 1;
        const fetchBatch = async (start: number) => {
          const promises = [0, 1, 2, 3].map(offset => 
            tmdbService.getMoviesByGenre(16, start + offset) // Genre 16 = Animation
          );
          const responses = await Promise.all(promises);
          return responses.flat();
        };

        const batch = await fetchBatch(startApiPage);
        const seen = new Set();
        const results = batch.filter(m => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return m.poster_path;
        }).slice(0, itemsPerPage);

        setMovies(results);
      } catch (error) {
        console.error("Erro ao carregar desenhos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKidsMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-1 bg-sky-500 rounded-full"></div>
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            CATÁLOGO <span className="text-sky-500">DESENHOS</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500 animate-pulse italic">Carregando Universo Kids...</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-6 md:gap-y-10">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onItemClick} />
              ))}
            </div>
            <div className="mt-24 flex justify-center items-center gap-6">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:border-sky-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-sky-500">Pág {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-white/5 flex items-center justify-center text-white hover:border-sky-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsMoviesTab;
