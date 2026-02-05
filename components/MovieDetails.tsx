import React, { useState, useEffect } from 'react';
import { BACKDROP_BASE_URL, IMAGE_BASE_URL, tmdbService } from '../services/tmdbService';
import { Movie, ContinueWatchingItem } from '../types';

interface MovieDetailsProps {
  movie: any;
  onClose: () => void;
  onWatch?: (movie: any, season?: number, episode?: number) => void;
  onToggleMyList?: (movie: Movie) => void;
  myList?: Movie[];
  initialSeason?: number;
  initialEpisode?: number;
  continueWatching?: ContinueWatchingItem[];
  isVip?: boolean;
  isTrial?: boolean;
  activeTab?: string;
  activeSubTab?: string | null;
  onRequestVip?: () => void;
}

type PlayerSource = 'embedplay' | 'superflix' | 'playerflix';

const MovieDetails: React.FC<MovieDetailsProps> = ({ 
  movie, onClose, onWatch, onToggleMyList, myList = [], initialSeason, initialEpisode, 
  continueWatching = [], isVip, isTrial, activeTab, activeSubTab, onRequestVip 
}) => {
  const [fullDetails, setFullDetails] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason || 1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [playerSource, setPlayerSource] = useState<PlayerSource>('embedplay');
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [pendingWatchArgs, setPendingWatchArgs] = useState<{s?: number, e?: number} | null>(null);
  
  const [localProgress, setLocalProgress] = useState<{s: number, e: number} | null>(null);

  const isSeries = !!(movie.first_air_date || movie.name);
  const isChannel = !!movie.isChannel;
  const isInList = myList.some(m => m.id === movie.id);
  const isSoapOpera = movie.genre_ids?.includes(10766) || activeSubTab === 'Novelas';

  useEffect(() => {
    if (isSeries) {
      const historyItem = continueWatching.find(item => item.id === movie.id);
      if (historyItem?.lastSeason && historyItem?.lastEpisode) {
        setLocalProgress({ s: historyItem.lastSeason, e: historyItem.lastEpisode });
        if (!initialSeason) setSelectedSeason(historyItem.lastSeason);
      }
    }
  }, [movie.id, isSeries, continueWatching, initialSeason]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (isChannel) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (isSeries) {
          const [details, extId] = await Promise.all([
            tmdbService.getTVDetails(movie.id),
            tmdbService.getTVExternalIds(movie.id)
          ]);
          setFullDetails(details);
          setImdbId(extId);
          
          const historyItem = continueWatching.find(item => item.id === movie.id);
          const seasonToLoad = initialSeason || historyItem?.lastSeason || details.seasons?.find((s: any) => s.season_number > 0)?.season_number || 1;
          setSelectedSeason(seasonToLoad);
          
          const seasonData = await tmdbService.getTVSeason(movie.id, seasonToLoad);
          setEpisodes(seasonData.episodes || []);
          
          if (isSoapOpera) {
            setPlayerSource('superflix');
          } else {
            setPlayerSource('embedplay');
          }
        } else {
          const [details, extId] = await Promise.all([
            tmdbService.getMovieDetails(movie.id),
            tmdbService.getImdbId(movie.id)
          ]);
          setFullDetails(details);
          setImdbId(extId);
          setPlayerSource('embedplay');
        }
      } catch (e) {
        console.error("Erro ao carregar detalhes", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [movie.id, isSeries, isChannel, initialSeason, continueWatching, isSoapOpera]);

  const getPlayerUrl = (source: PlayerSource, s?: number, e?: number) => {
    const currentImdb = imdbId || movie.imdb_id;
    if (isChannel) return movie.url;
    
    if (currentImdb === 'tt0452608' || movie.id === 10428) {
      return `https://embedplayapi.site/embed/movie?imdb=tt0452608`;
    }

    const effectiveSource = isSoapOpera ? 'superflix' : source;
    
    if (effectiveSource === 'embedplay') {
      if (isSeries) {
        const season = s || selectedSeason || 1;
        const episode = e || (episodes[0]?.episode_number) || 1;
        return `https://embedplayapi.site/embed/series?tmdb=${movie.id}&sea=${season}&epi=${episode}`;
      } else {
        const idParam = currentImdb ? `imdb=${currentImdb}` : `id=${movie.id}`;
        return `https://embedplayapi.site/embed/movie?${idParam}`;
      }
    } else if (effectiveSource === 'superflix') {
      const id = currentImdb || movie.id;
      if (isSeries) {
        const season = s || selectedSeason || 1;
        const episode = e || (episodes[0]?.episode_number) || 1;
        return `https://superflixapi.bond/serie/${movie.id}/${season}/${episode}`;
      } else {
        return `https://superflixapi.bond/filme/${id}`;
      }
    } else {
      const id = movie.id;
      if (isSeries) {
        const season = s || selectedSeason || 1;
        const episode = e || (episodes[0]?.episode_number) || 1;
        return `https://playerflixapi.com/serie/${id}/${season}/${episode}`;
      } else {
        return `https://playerflixapi.com/filme/${id}`;
      }
    }
  };

  const startWatching = (s?: number, e?: number) => {
    if (isTrial && !isVip) {
      if (onRequestVip) onRequestVip();
      return;
    }

    if (isTrial) {
       const isAsianContent = movie.origin_country?.some((c: string) => ['KR', 'JP', 'CN', 'TH'].includes(c));
       // Sagas (belongs_to_collection) agora são grátis para trial. Removido o bloqueio.
       if (isChannel || isSoapOpera || isAsianContent || activeTab === 'Canais Kids' || activeSubTab === 'Animes' || activeSubTab === 'Doramas') {
          if (onRequestVip) onRequestVip();
          return;
       }
    }

    if (!isVip && !movie.isFree) {
       if (onRequestVip) onRequestVip();
       return;
    }

    setPendingWatchArgs({ s, e });
    setShowAdAlert(true);
  };

  const confirmWatch = () => {
    setShowAdAlert(false);
    const { s, e } = pendingWatchArgs || {};

    if (isSeries) {
      const targetS = s || selectedSeason || 1;
      const targetE = e || (episodes[0]?.episode_number) || 1;
      setLocalProgress({ s: targetS, e: targetE });
      if (onWatch) onWatch(movie, targetS, targetE);
    } else {
      if (onWatch) onWatch(movie);
    }

    const videoUrl = getPlayerUrl(playerSource, s, e);
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setShowPlayer(true);
    }
  };

  const togglePlayerSource = () => {
    if (isSoapOpera) return;
    
    let newSource: PlayerSource;
    if (playerSource === 'embedplay') newSource = 'superflix';
    else if (playerSource === 'superflix') newSource = 'playerflix';
    else newSource = 'embedplay';
    
    setPlayerSource(newSource);
    const updatedUrl = getPlayerUrl(newSource, localProgress?.s, localProgress?.e);
    setCurrentVideoUrl(updatedUrl);
  };

  if (showPlayer) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex flex-col animate-in fade-in duration-500">
        <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <button onClick={() => setShowPlayer(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex flex-col truncate">
               <h3 className="font-black italic uppercase text-[10px] tracking-tighter truncate text-white leading-tight">
                {movie.title || movie.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full animate-pulse ${playerSource === 'embedplay' ? 'bg-rose-500' : playerSource === 'superflix' ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] italic ${playerSource === 'embedplay' ? 'text-rose-500' : playerSource === 'superflix' ? 'text-amber-500' : 'text-sky-500'}`}>
                  {playerSource === 'embedplay' ? 'Servidor 01 (Principal)' : playerSource === 'superflix' ? 'Servidor 02 (Alternativo)' : 'Servidor 03 (Contingência)'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isChannel && !isSoapOpera && (
              <button 
                onClick={togglePlayerSource} 
                className="group relative flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all active:scale-95 hover:bg-rose-600 hover:border-rose-500"
              >
                <svg className="w-3 h-3 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                <span className="text-[8px] font-black uppercase italic tracking-widest whitespace-nowrap text-zinc-400 group-hover:text-white">
                  Alternar Servidor <span className="opacity-40 ml-1">[{playerSource === 'embedplay' ? '1/3' : playerSource === 'superflix' ? '2/3' : '3/3'}]</span>
                </span>
              </button>
            )}
            {isSoapOpera && (
               <div className="bg-amber-500/10 border border-amber-500/40 px-3 py-1.5 rounded-xl">
                  <span className="text-[8px] font-black text-amber-500 uppercase italic tracking-widest">Player Único de Novelas</span>
               </div>
            )}
          </div>
        </div>
        <div className="flex-1 bg-black relative">
          <iframe 
            src={currentVideoUrl} 
            className="absolute inset-0 w-full h-full border-0" 
            allowFullScreen 
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            referrerPolicy="origin" 
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; xr-spatial-tracking; clipboard-write"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto block">
      {showAdAlert && (
        <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
              <div className="absolute top-0 inset-x-0 h-1 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]"></div>
              
              <div className="w-16 h-16 bg-rose-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-600/20">
                 <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter text-center mb-6">CENTRAL DE REPRODUÇÃO</h3>
              
              <div className="space-y-4 mb-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.08]">
                  <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest italic leading-relaxed">
                    <span className="text-white block mb-1.5">⚡ CONEXÃO TRIPLA:</span>
                    Disponibilizamos <span className="text-rose-500">3 SERVIDORES</span> exclusivos. Se o Servidor 01 não carregar, estiver sem áudio ou falhar, alterne no menu superior do vídeo para o 02 ou 03.
                  </p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.08]">
                  <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest italic leading-relaxed">
                    <span className="text-white block mb-1.5">🛡️ SOBRE ANÚNCIOS:</span>
                    Podem surgir apenas no <span className="text-rose-500">início do carregamento</span>. Após o play, o ThCine bloqueia interrupções para sua experiência ser perfeita.
                  </p>
                </div>
              </div>

              <button 
                onClick={confirmWatch}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                SOLTAR O PLAY AGORA
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
           </div>
        </div>
      )}

      <div className="relative w-full max-w-5xl bg-[#0a0a0a] min-h-screen md:min-h-0 md:my-10 md:rounded-[2.5rem] overflow-hidden border border-white/5 pb-20 text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 z-[2020] p-3 bg-black/50 hover:bg-rose-600 rounded-full text-white transition-all shadow-2xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="relative w-full aspect-video">
          <img src={isChannel ? movie.backdrop_path : `${BACKDROP_BASE_URL}${movie.backdrop_path}`} className="w-full h-full object-cover opacity-60" alt="Backdrop" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>

        <div className="px-6 md:px-16 -mt-24 md:-mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end mb-6">
            <div className="w-32 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-zinc-900">
              <img src={isChannel ? movie.poster_path : `${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover" alt="Poster" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none drop-shadow-2xl">{movie.title || movie.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4 text-[9px] font-black tracking-widest uppercase text-zinc-400">
                <span className="text-rose-500 font-black">PREMIUM {isChannel ? 'CANAL' : (isSeries ? (isSoapOpera ? 'NOVELA' : 'SÉRIE') : 'FILME')}</span>
                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : '2025'}</span>
                <span className="text-yellow-500">★ {movie.vote_average?.toFixed(1) || '10'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <button onClick={() => startWatching()} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-[1.2rem] font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-600/20 active:scale-95">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-xs tracking-widest uppercase">ASSISTIR AGORA</span>
            </button>
            {onToggleMyList && (
              <button onClick={() => onToggleMyList(movie as Movie)} className={`flex-1 md:flex-none px-8 py-3.5 rounded-[1.2rem] font-black flex items-center justify-center gap-2 transition-all border ${isInList ? 'bg-rose-600/10 border-rose-600 text-rose-500' : 'bg-zinc-900 border-white/10 text-white'}`}>
                <span className="text-xs tracking-widest uppercase">{isInList ? 'NA MINHA LISTA' : 'MINHA LISTA'}</span>
              </button>
            )}
          </div>

          <div className="mb-8">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500 mb-2">Sinopse</h4>
            <div className="relative">
              <p className={`text-zinc-300 text-xs md:text-base italic leading-relaxed opacity-80 ${isOverviewExpanded ? '' : 'line-clamp-2'}`}>{movie.overview || "Sem sinopse disponível."}</p>
              {movie.overview && movie.overview.length > 100 && (
                <button onClick={() => setIsOverviewExpanded(!isOverviewExpanded)} className="mt-1 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">
                  {isOverviewExpanded ? 'Ver Menos' : 'Ler Mais...'}
                </button>
              )}
            </div>
          </div>

          {isSeries && !isChannel && fullDetails && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-rose-600 rounded-full"></div>
                  <h3 className="text-lg font-bold italic tracking-tight uppercase">EPISÓDIOS</h3>
                </div>
                <select value={selectedSeason} onChange={(e) => setSelectedSeason(parseInt(e.target.value))} className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white outline-none">
                  {fullDetails.seasons?.filter((s:any) => s.season_number > 0).map((s: any) => (
                    <option key={s.id} value={s.season_number}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 pb-10">
                {episodes.map((ep: any) => {
                  const isActive = localProgress?.s === selectedSeason && localProgress?.e === ep.episode_number;
                  return (
                    <div key={ep.id} onClick={() => startWatching(selectedSeason, ep.episode_number)} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${isActive ? 'bg-rose-600/10 border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.2)]' : 'bg-zinc-900/40 hover:bg-zinc-800 border-transparent hover:border-white/5'}`}>
                      <div className={`w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 relative ${isActive ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0a0a0a]' : 'bg-zinc-800'}`}>
                        {ep.still_path && <img src={`${IMAGE_BASE_URL}${ep.still_path}`} className="w-full h-full object-cover" alt="" />}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <svg className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-2">
                           <p className={`text-[11px] font-bold uppercase italic truncate transition-colors ${isActive ? 'text-rose-500' : 'group-hover:text-rose-500'}`}>EP {ep.episode_number} - {ep.name}</p>
                           {isActive && <span className="bg-rose-600 text-[6px] text-white px-1.5 py-0.5 rounded font-black animate-pulse">ATUAL</span>}
                        </div>
                        <span className={`text-[7px] font-black uppercase tracking-widest ${isActive ? 'text-rose-500/70' : 'text-zinc-600'}`}>{isActive ? 'Assistindo agora' : 'Clique para reproduzir'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
