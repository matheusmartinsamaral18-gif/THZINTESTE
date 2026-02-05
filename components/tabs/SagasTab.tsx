
import React, { useState, useEffect } from 'react';
import MovieRow from '../MovieRow';
import { tmdbService } from '../../services/tmdbService';

interface SagasTabProps {
  onItemClick: (item: any) => void;
}

const SAGA_COLLECTIONS = [
  // PÁGINA 1
  { name: "Universo Marvel (MCU)", id: 86311 },
  { name: "DC Extended Universe", id: 414371 },
  { name: "Harry Potter", id: 1241 },
  { name: "Star Wars", id: 10 },
  { name: "Velozes & Furiosos", id: 9485 },
  { name: "John Wick", id: 403374 },
  { name: "O Senhor dos Anéis", id: 119 },
  // PÁGINA 2
  { name: "Jurassic Park", id: 328 },
  { name: "Transformers", id: 8650 },
  { name: "Piratas do Caribe", id: 295 },
  { name: "Missão: Impossível", id: 87359 },
  { name: "Jogos Vorazes", id: 131635 },
  { name: "Shrek", id: 21590 },
  { name: "A Era do Gelo", id: 8354 },
  // PÁGINA 3
  { name: "Mad Max", id: 8945 },
  { name: "Matrix", id: 2344 },
  { name: "Indiana Jones", id: 84 },
  { name: "Alien", id: 8091 },
  { name: "O Exterminador do Futuro", id: 1135 },
  { name: "Rocky Balboa", id: 1575 },
  { name: "Toy Story", id: 10194 },
  // PÁGINA 4
  { name: "Batman (Nolan)", id: 263 },
  { name: "Meu Malvado Favorito", id: 86066 },
  { name: "Duro de Matar", id: 1570 },
  { name: "Sherlock Holmes", id: 91612 },
  { name: "Busca Implacável", id: 111815 },
  { name: "Jason Bourne", id: 2011 },
  { name: "Planeta dos Macacos", id: 1733 },
  // PÁGINA 5
  { name: "Karatê Kid", id: 2470 },
  { name: "Homens de Preto", id: 5414 },
  { name: "Rambo", id: 1475 },
  { name: "Os Mercenários", id: 126125 },
  { name: "Resident Evil", id: 10521 },
  { name: "Anjos da Noite", id: 432 },
  { name: "Kung Fu Panda", id: 103099 },
  // PÁGINA 6
  { name: "Como Treinar o Seu Dragão", id: 120531 },
  { name: "Hotel Transilvânia", id: 215321 },
  { name: "Invocação do Mal", id: 414167 },
  { name: "Sobrenatural", id: 124632 },
  { name: "Jogos Mortais", id: 1380 },
  { name: "Pânico", id: 2503 },
  { name: "Premonição", id: 1573 },
  // PÁGINA 7
  { name: "Bad Boys", id: 114387 },
  { name: "Os Caça-Fantasmas", id: 94669 },
  { name: "Creed", id: 419266 },
  { name: "Homem-Aranha (Sam Raimi)", id: 538 },
  { name: "O Espetacular Homem-Aranha", id: 125134 },
  { name: "Deadpool", id: 448150 },
  { name: "X-Men", id: 748 }
];

const SagasTab: React.FC<SagasTabProps> = ({ onItemClick }) => {
  const [sagasData, setSagasData] = useState<{title: string, movies: any[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sagasPerPage = 7;

  const totalPages = Math.ceil(SAGA_COLLECTIONS.length / sagasPerPage);
  const currentSagaBatch = SAGA_COLLECTIONS.slice((currentPage - 1) * sagasPerPage, currentPage * sagasPerPage);

  useEffect(() => {
    const fetchSagas = async () => {
      setLoading(true);
      setSagasData([]);
      try {
        const promises = currentSagaBatch.map(async (saga) => {
          try {
            const data = await tmdbService.getCollection(saga.id);
            return {
              title: saga.name,
              movies: data.parts ? data.parts.filter((p: any) => p.poster_path) : []
            };
          } catch (e) {
            return { title: saga.name, movies: [] };
          }
        });
        const results = await Promise.all(promises);
        setSagasData(results.filter(r => r.movies.length > 0));
      } catch (error) {
        console.error("Erro ao carregar sagas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSagas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-rose-600 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]"></div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              GRANDES <span className="text-rose-600">SAGAS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-4 border-rose-600/10 border-t-rose-600 rounded-full animate-spin mb-6"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Reunindo Coleções...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          {sagasData.map((saga, idx) => (
            <MovieRow 
              key={`${currentPage}-${idx}`} 
              title={saga.title} 
              movies={saga.movies} 
              onMovieSelect={onItemClick} 
            />
          ))}

          {/* Paginação */}
          <div className="mt-16 flex justify-center items-center gap-6 pb-12">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:border-rose-600 transition-all shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-500">{currentPage} / {totalPages}</span>
              <span className="text-[7px] font-bold text-zinc-600 uppercase mt-1">Sagas</span>
            </div>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:border-rose-600 transition-all shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SagasTab;
