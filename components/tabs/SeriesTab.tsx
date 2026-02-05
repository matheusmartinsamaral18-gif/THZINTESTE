
import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import MovieCard from '../MovieCard';
import { tmdbService } from '../../services/tmdbService';

interface SeriesTabProps {
  onItemClick: (item: any) => void;
}

const SERIES_GENRES = [
  { name: 'Populares', id: 'popular' },
  { name: 'Ação & Aventura', id: 10759 },
  { name: 'Animação', id: 16 },
  { name: 'Comédia', id: 35 },
  { name: 'Crime', id: 80 },
  { name: 'Documentário', id: 99 },
  { name: 'Drama', id: 18 },
  { name: 'Mistério', id: 9648 },
  { name: 'Sci-Fi & Fantasia', id: 10765 }
];

const SeriesTab: React.FC<SeriesTabProps> = ({ onItemClick }) => {
  const [selectedGenre, setSelectedGenre] = useState<any>(SERIES_GENRES[0]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        const startApiPage = ((currentPage - 1) * 4) + 1;
        const fetchBatch = async (start: number) => {
          const baseUrl = `https://api.themoviedb.org/3`;
          const apiKey = '7fbf72dde2df3009cc613690d316ebd4';
          const genreFilter = selectedGenre.id === 'popular' ? '' : `&with_genres=${selectedGenre.id}`;
          
          const promises = [0, 1, 2, 3].map(offset => 
            fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=pt-BR&sort_by=popularity.desc&page=${start + offset}${genreFilter}`)
              .then(res => res.json())
          );
          
          const responses = await Promise.all(promises);
          return responses.flatMap(r => r.results || []);
        };

        const batch = await fetchBatch(startApiPage);
        const seen = new Set();
        const results = batch.filter(s => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return s.poster_path;
        }).slice(0, itemsPerPage);

        setSeries(results);
      } catch (error) {
        console.error("Erro ao carregar séries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedGenre, currentPage]);

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-rose-600 rounded-full"></div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              CATÁLOGO <span className="text-rose-600">SÉRIES</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar pb-2">
            {SERIES_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => { setSelectedGenre(genre); setCurrentPage(1); }}
                className={`flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedGenre.id === genre.id ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-white'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-rose-600/10 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Sincronizando Séries...</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-6 md:gap-y-10">
              {series.map((s) => (
                <MovieCard key={s.id} movie={s} onClick={onItemClick} />
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

export default SeriesTab;
