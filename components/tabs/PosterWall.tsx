
import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdbService';

const STATIC_POSTERS = [
  'https://image.tmdb.org/t/p/w500/q719jXXLsVp68uU4WpfHHYfm96b.jpg',
  'https://image.tmdb.org/t/p/w500/r7DuyYubhYv3YpGXRJ6v9p7OfpI.jpg',
  'https://image.tmdb.org/t/p/w500/uxzzNc0WGF9ps9p0jY7ZpD3v79G.jpg',
  'https://image.tmdb.org/t/p/w500/8pt3SclzLzSTa6zqupoAVCK1HQ.jpg',
  'https://image.tmdb.org/t/p/w500/7WsyChQZ3Zp.jpg',
  'https://image.tmdb.org/t/p/w500/i9p88390ja6S97Wp9fL6v9Y7vL6.jpg'
];

const PosterWall: React.FC = () => {
  const [posters, setPosters] = useState<string[]>(STATIC_POSTERS);

  useEffect(() => {
    tmdbService.getPosterWall().then(fetched => {
      if (fetched && fetched.length > 0) {
        setPosters(fetched.slice(0, 100));
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-zinc-950">
      {/* Opacidade aumentada para 85% para ficar bem claro */}
      <div className="absolute inset-0 grid grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-1.5 w-full h-full opacity-85 scale-110 origin-center">
        {posters.map((url, i) => (
          <div 
            key={i} 
            className="w-full aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 border border-white/10 shadow-lg"
          >
            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      
      {/* Overlays muito suaves para manter a visibilidade total das fotos */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]"></div>
    </div>
  );
};

export default PosterWall;
