
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import MovieCard from '../MovieCard';

interface AnimesTabProps {
  onItemClick: (item: any) => void;
}

const ANIME_FILTERS = [
  { name: 'Séries Anime', type: 'tv' },
  { name: 'Filmes Anime', type: 'movie' }
];

const AnimesTab: React.FC<AnimesTabProps> = ({ onItemClick }) => {
  const [activeFilter, setActiveFilter] = useState(ANIME_FILTERS[0]);
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  useEffect(() => {
    const loadAnimes = async () => {
      setLoading(true);
      try {
        const startApiPage = ((currentPage - 1) * 4) + 1;
        const fetchBatch = async (start: number) => {
          const baseUrl = `https://api.themoviedb.org/3`;
          const apiKey = '7fbf72dde2df3009cc613690d316ebd4';
          const type = activeFilter.type;
          
          const promises = [0, 1, 2, 3].map(offset => 
            fetch(`${baseUrl}/discover/${type}?api_key=${apiKey}&language=pt-BR&sort_by=popularity.desc&page=${start + offset}&with_genres=16&with_original_language=ja`)
              .then(res => res.json())
          );
          
          const responses = await Promise.all(promises);
          return responses.flatMap(r => r.results || []);
        };

        const batch = await fetchBatch(startApiPage);
        const seen = new Set();
        const results = batch.filter(a => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return a.poster_path;
        }).slice(0, itemsPerPage);

        setAnimes(results);
      } catch (error) {
        console.error("Erro ao carregar animes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilter, currentPage]);

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-rose-600 rounded-full"></div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              CATÁLOGO <span className="text-rose-600">ANIMES</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar pb-2">
            {ANIME_FILTERS.map((filter) => (
              <button
                key={filter.name}
                onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                className={`flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeFilter.name === filter.name ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-white'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-rose-600/10 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Carregando Universo Anime...</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-6 md:gap-y-10">
              {animes.map((a) => (
                <MovieCard key={a.id} movie={a} onClick={onItemClick} />
              ))}
            </div>
            <div className="mt-24 flex justify-center items-center gap-6">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:border-rose-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-500">Pág {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white hover:border-rose-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimesTab;
