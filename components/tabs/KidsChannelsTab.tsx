
import React from 'react';
import { rawData } from './ChannelsTab';
import MovieRow from '../MovieRow';

interface KidsChannelsTabProps {
  onItemClick: (item: any) => void;
}

const KidsChannelsTab: React.FC<KidsChannelsTabProps> = ({ onItemClick }) => {
  // Filtra canais que tenham a categoria Kids (ID: 2)
  const kidsChannels = rawData.channels
    .filter(ch => ch.categories.includes(2))
    .map((ch, index) => ({
      id: index + 2000000,
      title: ch.name,
      poster_path: ch.image,
      backdrop_path: ch.image,
      overview: `Assista ${ch.name} ao vivo e divirta-se!`,
      release_date: '2025-01-01',
      vote_average: 10,
      genre_ids: [],
      url: ch.url,
      isChannel: true,
      categories: ch.categories
    }));

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="px-4 md:px-12 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-1 bg-sky-500 rounded-full"></div>
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            CANAIS <span className="text-sky-500">KIDS AO VIVO</span>
          </h1>
        </div>

        {kidsChannels.length > 0 ? (
          <div className="space-y-12">
            <MovieRow title="Desenhos 24 Horas" movies={kidsChannels as any} onMovieSelect={onItemClick} />
            
            <div className="mt-12">
               <h4 className="px-12 text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 mb-8 italic">Explorar Todos os Canais Kids</h4>
               <div className="px-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6">
                  {kidsChannels.map(ch => (
                    <div key={ch.id} onClick={() => onItemClick(ch)} className="group cursor-pointer transition-transform hover:scale-105">
                        <div className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-sky-500 shadow-2xl relative">
                           <img src={ch.poster_path} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-white text-[10px] font-black uppercase tracking-widest">{ch.title}</span>
                           </div>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Canais em manutenção...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsChannelsTab;
