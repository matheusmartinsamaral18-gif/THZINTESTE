
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Profile, ContinueWatchingItem, Movie, Subscription } from './types';
import MovieDetails from './components/MovieDetails';
import MovieCard from './components/MovieCard';
import Login from './components/Login';
import Intro from './components/Intro';
import ProfileSelection, { AVATAR_OPTIONS } from './components/ProfileSelection';
import SubscriptionModal from './components/SubscriptionModal';
import VIPPreviewModal from './components/VIPPreviewModal';
import ProfileSettings from './components/ProfileSettings';
import { auth, db } from './services/firebaseService';
import { tmdbService } from './services/tmdbService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot, Timestamp, getDoc } from 'firebase/firestore';

import HomeTab from './components/tabs/HomeTab';
import MoviesTab from './components/tabs/MoviesTab';
import SeriesTab from './components/tabs/SeriesTab';
import AnimesTab from './components/tabs/AnimesTab';
import DoramasTab from './components/tabs/DoramasTab';
import NovelasTab from './components/tabs/NovelasTab';
import ChannelsTab from './components/tabs/ChannelsTab';
import SagasTab from './components/tabs/SagasTab';
import KidsMoviesTab from './components/tabs/KidsMoviesTab';
import KidsSeriesTab from './components/tabs/KidsSeriesTab';
import KidsChannelsTab from './components/tabs/KidsChannelsTab';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [myList, setMyList] = useState<Movie[]>([]);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Início');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [isProfileDashboardOpen, setIsProfileDashboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showVIPPreview, setShowVIPPreview] = useState(false);
  const [blockedClickCount, setBlockedClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{d:number, h:number, m:number, s:number}>({d:0, h:0, m:0, s:0});
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sanitizedEmail = useMemo(() => userEmail.toLowerCase().trim().replace(/\./g, '_'), [userEmail]);

  const isVip = useMemo(() => {
    if (!subscription) return false;
    return subscription.expiryDate > Date.now();
  }, [subscription]);

  const isTrial = useMemo(() => {
    return subscription?.planType === '7 Dias Grátis';
  }, [subscription]);

  const isExpiredTrial = useMemo(() => {
    return isTrial && !isVip;
  }, [isTrial, isVip]);

  useEffect(() => {
    let unsubscribeSub: () => void;
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setIsLoggedIn(true);
        const email = user.email.toLowerCase().trim();
        setUserEmail(email);
        const subDocId = email.replace(/\./g, '_');
        unsubscribeSub = onSnapshot(doc(db, "user_subscriptions", subDocId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubscription({
              planType: data.planType || 'VIP',
              startDate: data.startDate || Date.now(),
              expiryDate: data.expiryDate instanceof Timestamp ? data.expiryDate.toMillis() : (data.expiryDate || 0),
              status: data.status || 'active'
            });
          } else {
            setSubscription(null);
          }
        });
      } else {
        setIsLoggedIn(false);
        setSubscription(null);
        setUserEmail('');
      }
      setIsAuthLoading(false);
    });
    return () => { authUnsubscribe(); if (unsubscribeSub) unsubscribeSub(); };
  }, []);

  useEffect(() => {
    if (sanitizedEmail && selectedProfile) {
      setHasLoadedContent(false);
      const docId = `${sanitizedEmail}_${selectedProfile.id}`;
      const docRef = doc(db, "user_content", docId);
      
      const unsubscribeContent = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContinueWatching(data.continueWatching || []);
          setMyList(data.myList || []);
        } else {
          setContinueWatching([]);
          setMyList([]);
        }
        setHasLoadedContent(true);
      });

      return () => unsubscribeContent();
    }
  }, [sanitizedEmail, selectedProfile]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await tmdbService.searchMovies(searchQuery);
        setSearchResults(results as Movie[]);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (isVip && subscription) {
      const timer = setInterval(() => {
        const diff = subscription.expiryDate - Date.now();
        if (diff <= 0) {
          setTimeLeft({d:0, h:0, m:0, s:0});
          clearInterval(timer);
        } else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({d, h, m, s});
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isVip, subscription]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (label: string) => {
    setActiveTab(label);
    setActiveSubTab(null);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsProfileDashboardOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubTabSelection = (tabId: string) => {
    setActiveSubTab(tabId);
  };

  const handleSignOut = async () => { 
    try {
      setIsSettingsOpen(false);
      setIsProfileDashboardOpen(false);
      setSelectedProfile(null);
      setIsLoggedIn(false);
      await signOut(auth); 
      window.location.reload(); 
    } catch (e) {
      window.location.reload();
    }
  };

  const toggleMyList = async (movie: Movie) => {
    if (!sanitizedEmail || !selectedProfile) return;
    const docId = `${sanitizedEmail}_${selectedProfile.id}`;
    const docRef = doc(db, "user_content", docId);
    
    const docSnap = await getDoc(docRef);
    const currentList = docSnap.exists() ? (docSnap.data().myList || []) : myList;

    const movieSimple = {
      id: movie.id,
      title: movie.title || movie.name,
      name: movie.name || null,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date || null
    };

    const isAlreadyIn = currentList.some((m: any) => m.id === movie.id);
    const newList = isAlreadyIn 
      ? currentList.filter((m: any) => m.id !== movie.id) 
      : [movieSimple, ...currentList];
    
    setMyList(newList);
    await setDoc(docRef, { myList: newList }, { merge: true });
  };

  const saveWatchHistory = async (movie: any, s?: number, e?: number) => {
    if (!sanitizedEmail || !selectedProfile) return;
    const docId = `${sanitizedEmail}_${selectedProfile.id}`;
    const docRef = doc(db, "user_content", docId);

    const docSnap = await getDoc(docRef);
    const currentWatching = docSnap.exists() ? (docSnap.data().continueWatching || []) : continueWatching;

    const movieSimple = {
      id: movie.id,
      title: movie.title || movie.name,
      name: movie.name || null,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date || null
    };

    const updated = [
      { 
        ...movieSimple, 
        lastSeason: s, 
        lastEpisode: e, 
        watchedAt: Date.now(), 
        isSeries: !!(movie.first_air_date || movie.name) 
      }, 
      ...currentWatching.filter((i: any) => i.id !== movie.id)
    ].slice(0, 20);

    setContinueWatching(updated as ContinueWatchingItem[]);
    await setDoc(docRef, { continueWatching: updated }, { merge: true });
  };

  const handleItemClick = (item: any) => setSelectedMovie(item);

  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  const handleRequestVip = useCallback(() => {
    setBlockedClickCount(prev => prev + 1);
    setShowVIPPreview(true);
  }, []);

  if (showIntro) return <Intro onComplete={handleIntroComplete} />;

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-600/10 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic animate-pulse">ThCine Premium...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Login onLogin={(email) => { setUserEmail(email.toLowerCase().trim()); setIsLoggedIn(true); }} />;
  
  if (!selectedProfile) return (
    <ProfileSelection 
      userEmail={userEmail} 
      initialEditMode={profileEditMode}
      onSelect={(p) => { setSelectedProfile(p); setProfileEditMode(false); }} 
    />
  );

  const effectiveProfile = selectedProfile || { icon: AVATAR_OPTIONS[0].url, name: '', isKids: false };
  const TOP_CATEGORIES = effectiveProfile.isKids ? ['Desenhos', 'Séries Kids', 'Canais Kids'] : ['Filmes', 'Séries', 'Categorias'];
  const CATEGORY_MENU = [{ id: 'Animes', name: 'Animes' }, { id: 'Doramas', name: 'Doramas' }, { id: 'Canais TV', name: 'Canais TV' }, { id: 'Novelas', name: 'Novelas' }, { id: 'Sagas', name: 'Sagas' }];

  return (
    <div className={`min-h-screen ${effectiveProfile.isKids ? 'bg-[#001021]' : 'bg-black'} text-white flex flex-col pb-24`}>
      {/* Bloqueio de Trial Expirado */}
      {isExpiredTrial && <VIPPreviewModal isExpiredTrial={true} onConfirm={() => setShowSubscriptionModal(true)} onClose={() => {}} />}

      <nav className={`fixed top-0 w-full z-[800] transition-all duration-500 ${isScrolled || isSearchOpen || isProfileDashboardOpen ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-[1920px] mx-auto pt-6 px-6 flex items-center justify-between h-16 md:h-20">
          {!isSearchOpen ? (
            <>
              <div onClick={() => handleTabChange('Início')} className="cursor-pointer flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black italic text-white">ThCine</span>
                {effectiveProfile.isKids && <span className="bg-sky-500 text-[8px] font-black px-2 py-0.5 rounded italic">KIDS</span>}
                {isVip && !effectiveProfile.isKids && (
                  <span className={`${isTrial ? 'bg-sky-500' : 'bg-amber-500'} text-black text-[8px] font-black px-2 py-0.5 rounded italic`}>
                    {isTrial ? 'GRÁTIS' : 'VIP'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsSearchOpen(true); setIsProfileDashboardOpen(false); }} className="p-2 bg-white/5 rounded-full border border-white/10">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button onClick={() => setIsProfileDashboardOpen(!isProfileDashboardOpen)} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 overflow-hidden">
                  <img src={effectiveProfile.icon} className="w-full h-full object-cover" alt="" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-4">
              <input ref={searchInputRef} autoFocus type="text" placeholder="Busque..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-white/10 border border-white/10 rounded-xl py-2 px-5 text-sm outline-none font-medium placeholder:text-zinc-600" />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">Fechar</button>
            </div>
          )}
        </div>
        {!isSearchOpen && !isProfileDashboardOpen && (
           <div className="flex items-center gap-3 px-6 py-4 overflow-x-auto no-scrollbar justify-center">
              {TOP_CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => handleTabChange(cat)} 
                  className={`px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-[12px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap italic transition-all active:scale-95 border-2 ${
                    activeTab === cat 
                    ? (effectiveProfile.isKids 
                        ? 'bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] border-sky-300/50' 
                        : 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] border-rose-400/50'
                      ) 
                    : 'text-zinc-300 bg-white/[0.08] border-transparent hover:bg-white/[0.15] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        )}
      </nav>

      <main className="flex-1">
        {isProfileDashboardOpen ? (
          <div className="pt-40 flex flex-col items-center px-6 pb-20 max-w-lg mx-auto relative animate-in fade-in zoom-in duration-500">
            <button onClick={() => setIsSettingsOpen(true)} className="absolute top-40 right-10 p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:border-white transition-all active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="relative mb-6">
              <div className={`w-28 h-28 rounded-[2rem] border-4 ${effectiveProfile.isKids ? 'border-sky-500' : 'border-rose-600'} overflow-hidden shadow-2xl`}><img src={effectiveProfile.icon} className="w-full h-full object-cover" alt="" /></div>
              {isVip && <div className={`absolute -bottom-1 right-2 ${isTrial ? 'bg-sky-500' : 'bg-amber-500'} text-black text-[7px] font-black px-2 py-0.5 rounded-full border border-black`}>{isTrial ? 'GRÁTIS' : 'VIP'}</div>}
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-1 tracking-tighter">{effectiveProfile.name}</h2>
            <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mb-2">{userEmail}</p>
            <div className="flex flex-col items-center gap-2 mb-8">
              {isVip ? (
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isTrial ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}><div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isTrial ? 'bg-sky-500' : 'bg-amber-500'}`}></div><span className={`text-[9px] font-black uppercase italic tracking-widest ${isTrial ? 'text-sky-500' : 'text-amber-500'}`}>{isTrial ? 'Acesso: Filmes e Séries (Grátis)' : 'Acesso: Catálogo Completo (VIP)'}</span></div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div><span className="text-[9px] font-black uppercase italic tracking-widest text-zinc-500">Acesso: Restrito (Sem Assinatura)</span></div>
              )}
            </div>
            <div className="w-full space-y-4">
              {isVip && (
                <div className="w-full p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-center mb-2">
                   <p className={`${isTrial ? 'text-sky-500' : 'text-amber-500'} text-[7px] font-black uppercase tracking-widest italic mb-2`}>Tempo Restante:</p>
                   <div className="flex items-center justify-center gap-3">
                      <div className="flex flex-col"><span className="text-sm font-black italic leading-none">{timeLeft.d}</span><span className="text-[5px] font-bold text-zinc-600 uppercase">Dias</span></div>
                      <span className="text-zinc-800 text-[10px]">:</span>
                      <div className="flex flex-col"><span className="text-sm font-black italic leading-none">{timeLeft.h}</span><span className="text-[5px] font-bold text-zinc-600 uppercase">Hrs</span></div>
                      <span className="text-zinc-800 text-[10px]">:</span>
                      <div className="flex flex-col"><span className="text-sm font-black italic leading-none">{timeLeft.m}</span><span className="text-[5px] font-bold text-zinc-600 uppercase">Min</span></div>
                      <span className="text-zinc-800 text-[10px]">:</span>
                      <div className="flex flex-col"><span className="text-sm font-black italic leading-none text-rose-600">{timeLeft.s}</span><span className="text-[5px] font-bold text-zinc-600 uppercase">Seg</span></div>
                   </div>
                   <button onClick={() => { setShowSubscriptionModal(true); setIsProfileDashboardOpen(false); }} className={`mt-4 w-full py-3 rounded-xl ${isTrial ? 'bg-sky-500' : 'bg-amber-500'} text-black font-black uppercase text-[8px] tracking-widest italic active:scale-95`}>{isTrial ? "Assinar VIP Premium" : "Estender VIP"}</button>
                </div>
              )}
              {!isVip && <button onClick={() => { setShowSubscriptionModal(true); setIsProfileDashboardOpen(false); }} className="w-full py-5 rounded-3xl bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest italic shadow-xl shadow-rose-600/20">Assinar VIP Premium</button>}
            </div>
            <div className="w-full mt-12 space-y-6">
              <div className="flex items-center gap-3"><div className={`w-1 h-5 rounded-full ${effectiveProfile.isKids ? 'bg-sky-500' : 'bg-rose-600'}`}></div><h3 className="text-sm font-black uppercase italic tracking-tighter">Minha Lista</h3></div>
              {myList && myList.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">{myList.map(movie => <MovieCard key={movie.id} movie={movie} onClick={handleItemClick} />)}</div>
              ) : (
                <div className="w-full py-12 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-2"><svg className="w-8 h-8 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 italic">Sua lista está vazia</p></div>
              )}
            </div>
          </div>
        ) : isSearchOpen && searchQuery.trim() ? (
          <div className="pt-32 px-6 animate-in fade-in duration-500"><div className="flex items-center gap-4 mb-10"><div className="w-1.5 h-6 bg-rose-600 rounded-full"></div><h2 className="text-lg font-black italic uppercase tracking-tighter">Resultados para: {searchQuery}</h2></div>{isSearching ? <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="w-8 h-8 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-widest italic text-zinc-600">Buscando no ThCine...</p></div> : searchResults.length > 0 ? <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4 gap-y-10">{searchResults.map(m => <MovieCard key={m.id} movie={m} onClick={handleItemClick} />)}</div> : <div className="text-center py-20"><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic opacity-50">Nenhum título encontrado.</p></div>}</div>
        ) : (
          <div className="pt-0">
            {activeTab === 'Início' && <HomeTab onItemClick={handleItemClick} isKids={effectiveProfile.isKids} continueWatching={continueWatching} onToggleMyList={toggleMyList} myList={myList} />}
            {activeTab === 'Filmes' && <div className="pt-36"><MoviesTab onItemClick={handleItemClick} /></div>}
            {activeTab === 'Séries' && <div className="pt-36"><SeriesTab onItemClick={handleItemClick} /></div>}
            {activeTab === 'Categorias' && !activeSubTab && <div className="pt-44 px-8 max-sm mx-auto pb-32"><div className="flex items-center gap-4 mb-8"><div className="w-1 h-6 bg-rose-600 rounded-full"></div><h1 className="text-xl font-black italic uppercase tracking-tighter">Categorias</h1></div><div className="flex flex-col gap-3">{CATEGORY_MENU.map(sub => <div key={sub.id} onClick={() => handleSubTabSelection(sub.id)} className="group relative h-14 rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-900/40 hover:bg-zinc-800 transition-all flex items-center justify-center hover:border-rose-600/50"><span className="text-xs font-black italic uppercase tracking-widest text-zinc-400 group-hover:text-white">{sub.name}</span></div>)}</div></div>}
            {activeTab === 'Categorias' && activeSubTab && (
              <div className="pt-32 relative">
                <button onClick={() => setActiveSubTab(null)} className="absolute top-36 left-8 z-[900] flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic hover:bg-rose-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                  Voltar
                </button>
                <div className="pt-12">
                  {activeSubTab === 'Animes' && <AnimesTab onItemClick={handleItemClick} />}
                  {activeSubTab === 'Doramas' && <DoramasTab onItemClick={handleItemClick} />}
                  {activeSubTab === 'Canais TV' && <ChannelsTab onItemClick={handleItemClick} />}
                  {activeSubTab === 'Novelas' && <NovelasTab onItemClick={handleItemClick} />}
                  {activeSubTab === 'Sagas' && <SagasTab onItemClick={handleItemClick} />}
                </div>
              </div>
            )}
            {activeTab === 'Desenhos' && <div className="pt-36"><KidsMoviesTab onItemClick={handleItemClick} /></div>}
            {activeTab === 'Séries Kids' && <div className="pt-36"><KidsSeriesTab onItemClick={handleItemClick} /></div>}
            {activeTab === 'Canais Kids' && <div className="pt-36"><KidsChannelsTab onItemClick={handleItemClick} /></div>}
          </div>
        )}
      </main>

      <div className={`fixed bottom-0 left-0 w-full backdrop-blur-xl border-t border-white/5 z-[600] px-6 py-5 flex items-center justify-around ${effectiveProfile.isKids ? 'bg-[#001021]/95' : 'bg-black/95'}`}>
        <button onClick={() => { handleTabChange('Início'); setIsProfileDashboardOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Início' && !isProfileDashboardOpen && !isSearchOpen ? (effectiveProfile.isKids ? 'text-sky-500' : 'text-rose-600') : 'text-zinc-600'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span className="text-[8px] font-black tracking-widest uppercase">INÍCIO</span></button>
        <button onClick={() => setIsProfileDashboardOpen(true)} className={`flex flex-col items-center gap-1 transition-all ${isProfileDashboardOpen ? (effectiveProfile.isKids ? 'text-sky-500' : 'text-rose-600') : 'text-zinc-600'}`}><div className={`w-6 h-6 rounded-lg overflow-hidden border ${isProfileDashboardOpen ? (effectiveProfile.isKids ? 'border-sky-500' : 'border-rose-600') : 'border-transparent'}`}><img src={effectiveProfile.icon} className="w-full h-full object-cover" alt="" /></div><span className="text-[8px] font-black tracking-widest uppercase">PERFIL</span></button>
      </div>

      {showSubscriptionModal && <SubscriptionModal userEmail={userEmail} userName={effectiveProfile.name} onClose={() => setShowSubscriptionModal(false)} />}
      {showVIPPreview && <VIPPreviewModal isExpiredTrial={isExpiredTrial} isPersistentInterest={blockedClickCount >= 2} onConfirm={() => { setShowVIPPreview(false); setShowSubscriptionModal(true); }} onClose={() => setShowVIPPreview(false)} />}
      {isSettingsOpen && <ProfileSettings isKids={effectiveProfile.isKids} onSwitchProfile={() => { setSelectedProfile(null); setProfileEditMode(false); setIsSettingsOpen(false); setIsProfileDashboardOpen(false); }} onManageProfiles={() => { setSelectedProfile(null); setProfileEditMode(true); setIsSettingsOpen(false); setIsProfileDashboardOpen(false); }} onSignOut={handleSignOut} onClose={() => setIsSettingsOpen(false)} />}
      {selectedMovie && <MovieDetails movie={selectedMovie} onClose={() => setSelectedMovie(null)} onWatch={saveWatchHistory} onToggleMyList={toggleMyList} myList={myList} continueWatching={continueWatching} isVip={isVip} isTrial={isTrial} activeTab={activeTab} activeSubTab={activeSubTab} onRequestVip={handleRequestVip} />}
    </div>
  );
};

export default App;
