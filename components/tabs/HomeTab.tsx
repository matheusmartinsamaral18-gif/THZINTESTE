
import React, { useState, useEffect } from 'react';
import MovieRow from '../MovieRow';
import MovieCard from '../MovieCard';
import { ContinueWatchingItem, Movie } from '../../types';
import { tmdbService, BACKDROP_BASE_URL } from '../../services/tmdbService';
import { SkeletonHero, SkeletonRow } from '../Skeleton';

interface HomeTabProps {
  onItemClick: (item: any) => void;
  isKids?: boolean;
  continueWatching?: ContinueWatchingItem[];
  onToggleMyList: (movie: Movie) => void;
  myList: Movie[];
}

const HomeTab: React.FC<HomeTabProps> = ({ onItemClick, isKids, continueWatching = [], onToggleMyList, myList }) => {
  const [featured, setFeatured] = useState<any | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [topSeries, setTopSeries] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [drama, setDrama] = useState<Movie[]>([]);
  const [romance, setRomance] = useState<Movie[]>([]);
  const [scifi, setScifi] = useState<Movie[]>([]);
  const [animations, setAnimations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        let trendingData, popularMoviesData, animationData, horrorData, actionData, comedyData, dramaData, romanceData, scifiData;

        if (isKids) {
          [trendingData, popularMoviesData, animationData, actionData, comedyData, scifiData] = await Promise.all([
            tmdbService.getMoviesByGenre(16, 1),
            tmdbService.getMoviesByGenre(10751, 1),
            tmdbService.getMoviesByGenre(16, 2),
            tmdbService.getMoviesByGenre(12, 1), 
            tmdbService.getMoviesByGenre(35, 1), 
            tmdbService.getMoviesByGenre(14, 1), 
          ]);
          setTopMovies(popularMoviesData.slice(0, 10));
          setAnimations(animationData);
          setAction(actionData);
          setComedy(comedyData);
          setScifi(scifiData);
          setTopSeries([]);
        } else {
          const resSeries = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=7fbf72dde2df3009cc613690d316ebd4&language=pt-BR&page=1`);
          const dataSeries = await resSeries.json();
          const mappedSeries = (dataSeries.results || []).map((s: any) => ({
            ...s,
            title: s.name,
            release_date: s.first_air_date
          })).slice(0, 10);

          [
            trendingData, 
            popularMoviesData, 
            horrorData, 
            actionData, 
            comedyData, 
            dramaData, 
            romanceData, 
            scifiData, 
            animationData
          ] = await Promise.all([
            tmdbService.getTrending(1),
            tmdbService.getPopular(1),
            tmdbService.getMoviesByGenre(27, 1), 
            tmdbService.getMoviesByGenre(28, 1), 
            tmdbService.getMoviesByGenre(35, 1), 
            tmdbService.getMoviesByGenre(18, 1), 
            tmdbService.getMoviesByGenre(10749, 1), 
            tmdbService.getMoviesByGenre(878, 1), 
            tmdbService.getMoviesByGenre(16, 1), 
          ]);

          setTopMovies(popularMoviesData.slice(0, 10));
          setTopSeries(mappedSeries);
          setHorror(horrorData);
          setAction(actionData);
          setComedy(comedyData);
          setDrama(dramaData);
          setRomance(romanceData);
          setScifi(scifiData);
          setAnimations(animationData);
        }

        setTrending(trendingData);
        setFeatured(trendingData[0] || popularMoviesData[0]);
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [isKids]);

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500">
        <SkeletonHero />
        <div className="space-y-12 -mt-32 relative z-20">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in duration-1000">
      {featured && (
        <div className="relative w-full h-[88vh] md:h-[95vh] flex items-end">
          <div className="absolute inset-0">
            <img 
              src={`${BACKDROP_BASE_URL}${featured.backdrop_path}`} 
              className="w-full h-full object-cover" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full px-6 md:px-16 pb-20 md:pb-32 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase italic shadow-lg ${isKids ? 'bg-sky-500' : 'bg-rose-600'}`}>
                {isKids ? 'Kids ThCine' : 'Original ThCine'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 leading-[0.9] drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
              {featured.title || featured.name}
            </h1>
            
            <p className="text-zinc-300 text-sm md:text-lg italic mb-10 line-clamp-3 md:line-clamp-2 max-w-2xl opacity-90">
              {featured.overview || "Descubra agora este título emocionante."}
            </p>

            <div className="flex flex-wrap items-center gap-4">
               <button 
                onClick={() => onItemClick(featured)}
                className={`px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl active:scale-95 ${isKids ? 'bg-sky-500 text-white' : 'bg-white text-black'}`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Assistir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-20 space-y-12 md:space-y-24 -mt-16 md:-mt-32">
        {continueWatching.length > 0 && (
          <MovieRow title="Continuar Assistindo" movies={continueWatching as any} onMovieSelect={onItemClick} />
        )}

        {/* Parede de Sucessos - Agora em formato de fileira para arrastar */}
        <MovieRow 
          title="Parede de Sucessos" 
          movies={trending.slice(0, 15)} 
          onMovieSelect={onItemClick} 
          isNewRow={true}
        />

        <MovieRow title={isKids ? "Top 10 Desenhos" : "Top 10 Filmes"} movies={topMovies} onMovieSelect={onItemClick} showRanking={true} />
        <MovieRow title="Recém Adicionados" movies={trending.slice(15, 30)} onMovieSelect={onItemClick} isNewRow={true} />
        {topSeries.length > 0 && <MovieRow title="Séries Populares" movies={topSeries} onMovieSelect={onItemClick} showRanking={true} />}
        
        {!isKids && horror.length > 0 && <MovieRow title="Top 10 Terror Mais Assistidos" movies={horror.slice(0, 10)} onMovieSelect={onItemClick} showRanking={true} />}
        {!isKids && action.length > 0 && <MovieRow title="Adrenalina e Ação" movies={action} onMovieSelect={onItemClick} />}
        {!isKids && comedy.length > 0 && <MovieRow title="Para Dar Risada" movies={comedy} onMovieSelect={onItemClick} />}
        {!isKids && drama.length > 0 && <MovieRow title="Dramas Impactantes" movies={drama} onMovieSelect={onItemClick} />}
        {!isKids && romance.length > 0 && <MovieRow title="Romances Inesquecíveis" movies={romance} onMovieSelect={onItemClick} />}
        {!isKids && scifi.length > 0 && <MovieRow title="Ficção Científica e Futuro" movies={scifi} onMovieSelect={onItemClick} />}
        
        {isKids && action.length > 0 && <MovieRow title="Aventuras Incríveis" movies={action} onMovieSelect={onItemClick} />}
        {isKids && comedy.length > 0 && <MovieRow title="Diversão Garantida" movies={comedy} onMovieSelect={onItemClick} />}
        {isKids && scifi.length > 0 && <MovieRow title="Mundo de Fantasia" movies={scifi} onMovieSelect={onItemClick} />}

        <MovieRow title="Universo Animado" movies={animations} onMovieSelect={onItemClick} />
      </div>
    </div>
  );
};

export default HomeTab;
