
import React from 'react';
import { Movie } from '../types';
import { IMAGE_BASE_URL } from '../services/tmdbService';

interface MovieCardProps {
  movie: any;
  onClick: (movie: any) => void;
  isNew?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, isNew = false }) => {
  const isChannel = !!movie.isChannel;
  const posterUrl = isChannel ? movie.poster_path : `${IMAGE_BASE_URL}${movie.poster_path}`;
  
  return (
    <div 
      onClick={() => onClick(movie)}
      className={`relative flex-none ${isChannel ? 'w-56 md:w-72' : 'w-[30vw] md:w-52'} group cursor-pointer transition-all duration-500 hover:scale-105 z-10 hover:z-20`}
    >
      <div className={`relative ${isChannel ? 'aspect-video' : 'aspect-[2/3]'} overflow-hidden rounded-xl md:rounded-[1.5rem] bg-zinc-900 shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:shadow-rose-600/30 group-hover:ring-2 group-hover:ring-rose-500/50`}>
        {movie.poster_path ? (
          <img 
            src={posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center text-zinc-700 bg-zinc-900/50 text-[10px] font-black uppercase italic">
            {movie.title || movie.name}
          </div>
        )}

        {/* Efeito de Vidro/Brilho Cinematico */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Sombra de Fundo para o Texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

        {isNew && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-rose-600 text-white text-[7px] md:text-[9px] font-black px-2 py-1 rounded shadow-xl uppercase tracking-tighter italic animate-pulse">
              NOVO
            </div>
          </div>
        )}
        
        {isChannel && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded shadow-xl uppercase italic tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              LIVE
            </div>
          </div>
        )}
        
        {/* Informações Rápidas no Hover */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <h3 className="text-white font-black text-[9px] md:text-[11px] line-clamp-1 uppercase tracking-tighter italic drop-shadow-md">
            {movie.title || movie.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400 text-[7px] md:text-[9px] font-black">★ {movie.vote_average?.toFixed(1) || '10'}</span>
            <span className="text-zinc-400 text-[7px] md:text-[9px] font-bold uppercase">{movie.release_date ? new Date(movie.release_date).getFullYear() : '2025'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
