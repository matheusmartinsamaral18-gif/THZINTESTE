
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { db, auth } from '../services/firebaseService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import PosterWall from './PosterWall';
import { getDeviceFingerprint } from '../services/subscriptionService';

interface ProfileSelectionProps {
  userEmail: string;
  onSelect: (profile: Profile) => void;
  initialEditMode?: boolean;
}

export const AVATAR_OPTIONS = [
  { name: 'SpongeBob', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Avatar/0f8fdf7e74de44bff4a499724facf4936b6f21bf/372f9514a7a69bafcee82512a8bd3df9.jpg' },
  { name: 'Luffy', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Th/2d9190755c10c83a9913e5cae1a2fc8cd398a122/Screenshot_20260113_155246_Netflix.jpg' },
  { name: 'Raven', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Thkk/4e06d3cf27034b3108614e783a8dcc0873f1a16d/fd1b4a728f87001ca319a0458251c234.gif' },
  { name: 'Pikachu', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Thkk/4e06d3cf27034b3108614e783a8dcc0873f1a16d/c3362993f53cd865c4aeb711e8d0a175.gif' },
  { name: 'Stitch', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Thkk/4e06d3cf27034b3108614e783a8dcc0873f1a16d/8ddd3fb1a26aebad7270538cc82b8704.jpg' },
  { name: 'Pink', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Thkk/4e06d3cf27034b3108614e783a8dcc0873f1a16d/32a849aaf205b143c1a2b78d4b8bcf4b.jpg' },
  { name: 'Teal', url: 'https://raw.githubusercontent.com/matheusmartinsamaral19-code/Thkk/4e06d3cf27034b3108614e783a8dcc0873f1a16d/323ecca68b7105d23184e783b86b0c5a.jpg' }
];

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ userEmail, onSelect, initialEditMode = false }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<'selection' | 'adding' | 'blocked'>('selection');
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);

  const hasKidsProfile = profiles.some(p => p.isKids);
  const hasAdultProfile = profiles.some(p => !p.isKids);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userEmail) return;
      setIsLoading(true);
      try {
        const docId = userEmail.toLowerCase().trim().replace(/\./g, '_');
        const docRef = doc(db, "users_profiles", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfiles(docSnap.data().profiles || []);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error("Erro ao buscar perfis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [userEmail]);

  useEffect(() => {
    if (viewState === 'adding') {
      if (hasAdultProfile && !hasKidsProfile) {
        setIsKids(true);
      } else if (hasKidsProfile && !hasAdultProfile) {
        setIsKids(false);
      }
    }
  }, [viewState, hasAdultProfile, hasKidsProfile]);

  const handleProfileClick = async (profile: Profile) => {
    if (isEditing) return;

    // TENTAR ATIVAR TELA CHEIA AO SELECIONAR PERFIL
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).msRequestFullscreen) {
        (docEl as any).msRequestFullscreen();
      }
    } catch (e) {
      console.warn("Navegador bloqueou tela cheia ou não suportado:", e);
    }

    const currentDeviceId = getDeviceFingerprint();

    // Se o perfil já tem um dispositivo e não é este
    if (profile.deviceId && profile.deviceId !== currentDeviceId) {
      setViewState('blocked');
      return;
    }

    // Se o perfil não tem dispositivo (primeiro acesso), vincula agora
    if (!profile.deviceId) {
      const updatedProfiles = profiles.map(p => 
        p.id === profile.id ? { ...p, deviceId: currentDeviceId } : p
      );
      setProfiles(updatedProfiles);
      try {
        const docId = userEmail.toLowerCase().trim().replace(/\./g, '_');
        const docRef = doc(db, "users_profiles", docId);
        await updateDoc(docRef, { profiles: updatedProfiles });
        onSelect({ ...profile, deviceId: currentDeviceId });
      } catch (e) {
        console.error("Erro ao vincular dispositivo:", e);
        onSelect(profile);
      }
    } else {
      onSelect(profile);
    }
  };

  const handleAddProfile = async () => {
    if (!newName.trim()) return;
    const currentDeviceId = getDeviceFingerprint();
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newName.trim(),
      icon: selectedAvatar,
      isKids: isKids,
      deviceId: currentDeviceId // Já vincula na criação
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    try {
      const docId = userEmail.toLowerCase().trim().replace(/\./g, '_');
      const docRef = doc(db, "users_profiles", docId);
      await setDoc(docRef, { profiles: updated }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
    setNewName('');
    setIsKids(false);
    setSelectedAvatar(AVATAR_OPTIONS[0].url);
    setViewState('selection');
  };

  const removeProfile = async (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    try {
      const docId = userEmail.toLowerCase().trim().replace(/\./g, '_');
      const docRef = doc(db, "users_profiles", docId);
      await updateDoc(docRef, { profiles: updated });
    } catch (error) {
      console.error("Erro ao remover perfil:", error);
    }
  };

  const handleBackToLogin = async () => {
    await auth.signOut();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[6000] bg-black flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 italic">Iniciando sessão...</p>
      </div>
    );
  }

  // TELA DE BLOQUEIO (DISPOSITIVO NÃO RECONHECIDO)
  if (viewState === 'blocked') {
    return (
      <div className="fixed inset-0 z-[8000] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <PosterWall />
        <div className="absolute inset-0 bg-black/90 z-10 backdrop-blur-md"></div>
        
        <div className="relative z-20 max-w-sm w-full bg-zinc-900/50 border border-white/5 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]"></div>
          
          <div className="w-20 h-20 bg-rose-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-600/20">
            <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            ACESSO <br/> <span className="text-rose-600">NEGADO</span>
          </h2>
          
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic mb-10">
            Este perfil já está vinculado a outro aparelho. <br/><br/>
            Cada usuário deve ter sua própria conta pessoal. Por favor, crie sua conta para continuar assistindo.
          </p>

          <button 
            onClick={handleBackToLogin}
            className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest italic active:scale-95 shadow-xl shadow-rose-600/20 transition-all"
          >
            VOLTAR AO LOGIN
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'selection') {
    return (
      <div className="fixed inset-0 z-[6000] bg-[#070708] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
        <PosterWall />
        <div className="absolute inset-0 bg-black/70 z-10 backdrop-blur-sm"></div>

        <div className="relative z-20 w-full max-w-4xl flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
              {isEditing ? 'GERENCIAR' : 'QUEM ESTÁ'} <span className="text-rose-600">{isEditing ? 'PERFIS' : 'ASSISTINDO?'}</span>
            </h1>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] italic">
              {isEditing ? 'Toque no X para remover um perfil' : 'Escolha um perfil para continuar'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                onClick={() => handleProfileClick(profile)}
                className="group flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="relative">
                  <div className={`relative w-24 h-24 md:w-36 md:h-36 rounded-2xl md:rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${
                    isEditing 
                    ? 'scale-90 ring-4 ring-rose-600/50' 
                    : 'group-hover:scale-105 group-hover:ring-4 group-hover:ring-white group-active:scale-95'
                  }`}>
                    <img src={profile.icon} className={`w-full h-full object-cover ${isEditing ? 'opacity-40' : ''}`} alt="" />
                    {profile.isKids && (
                      <div className="absolute bottom-0 inset-x-0 bg-sky-500 py-0.5 text-center">
                        <span className="text-[7px] font-black text-white italic uppercase">KIDS</span>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeProfile(profile.id); }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="bg-rose-600 p-3 rounded-full shadow-lg transform scale-125 hover:bg-rose-500 transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                    </button>
                  )}
                </div>
                <span className="text-[11px] md:text-sm font-black uppercase italic tracking-tight text-zinc-400 group-hover:text-white transition-colors">{profile.name}</span>
              </div>
            ))}

            {!isEditing && profiles.length < 2 && (
              <div onClick={() => setViewState('adding')} className="group flex flex-col items-center gap-4 cursor-pointer">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl md:rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center transition-all group-hover:bg-rose-600/10 group-hover:border-rose-600 group-hover:scale-105">
                  <svg className="w-8 h-8 text-zinc-600 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-[11px] md:text-sm font-black uppercase italic tracking-tight text-zinc-600 group-hover:text-white transition-colors">Adicionar</span>
              </div>
            )}
          </div>

          {isEditing && (
             <button 
              onClick={() => setIsEditing(false)} 
              className="mt-16 px-10 py-3 rounded-xl border border-rose-600 bg-rose-600/10 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-white hover:bg-rose-600 transition-all italic"
            >
              CONCLUÍDO
            </button>
          )}
        </div>
      </div>
    );
  }

  const isToggleDisabled = (hasAdultProfile && !hasKidsProfile) || (hasKidsProfile && !hasAdultProfile);

  return (
    <div className={`fixed inset-0 z-[7000] ${isKids ? 'bg-[#000d1a]' : 'bg-[#0a0a0b]'} flex flex-col animate-in slide-in-from-right duration-500 transition-colors`}>
      <header className="px-8 py-8 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => { setViewState('selection'); setNewName(''); setIsKids(false); }}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest italic">Voltar</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-black italic uppercase tracking-tighter">
            NOVO <span className={isKids ? 'text-sky-500' : 'text-rose-600'}>PERFIL</span>
          </h2>
        </div>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-lg space-y-12">
          
          <div className="flex flex-col items-center gap-6">
            <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 transition-all duration-500 ${isKids ? 'border-sky-500 shadow-2xl shadow-sky-500/20' : 'border-rose-600 shadow-2xl shadow-rose-600/20'}`}>
              <img src={selectedAvatar} className="w-full h-full object-cover" alt="Preview" />
              {isKids && (
                <div className="absolute bottom-0 inset-x-0 bg-sky-500 py-1 text-center">
                   <span className="text-[8px] font-black text-white italic">KIDS</span>
                </div>
              )}
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Este será seu ícone</p>
          </div>

          <div className="space-y-3">
            <label className="text-zinc-600 text-[8px] font-black uppercase tracking-widest ml-1 italic">Qual o seu nome?</label>
            <input 
              type="text" 
              maxLength={15}
              placeholder="Ex: Matheus..." 
              className={`w-full bg-white/5 border-b border-white/10 py-4 px-4 text-white text-xl md:text-3xl font-black italic tracking-tighter outline-none transition-all placeholder:text-zinc-800 text-center ${isKids ? 'focus:border-sky-500' : 'focus:border-rose-600'}`} 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <p className="text-center text-zinc-600 text-[8px] font-black uppercase tracking-widest italic">Mudar Ícone</p>
            <div className="flex flex-wrap justify-center gap-3">
              {AVATAR_OPTIONS.map((avatar, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === avatar.url ? (isKids ? 'border-sky-500 scale-110 shadow-lg' : 'border-rose-600 scale-110 shadow-lg') : 'border-white/5 opacity-30 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={avatar.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${isKids ? 'bg-sky-500/5 border-sky-500/20' : 'bg-white/5 border-white/5'}`}>
            <div className="flex flex-col">
              <span className="text-white font-black italic uppercase tracking-tight text-sm">Perfil Infantil</span>
              <span className="text-zinc-600 text-[8px] uppercase font-bold tracking-widest">
                {isToggleDisabled ? 'Tipo definido pelo limite da conta' : 'Restringir conteúdo impróprio'}
              </span>
            </div>
            <button 
              disabled={isToggleDisabled}
              onClick={() => setIsKids(!isKids)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isKids ? 'bg-sky-500' : 'bg-zinc-800'} ${isToggleDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isKids ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              onClick={handleAddProfile} 
              disabled={!newName.trim()}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest italic transition-all disabled:opacity-20 ${isKids ? 'bg-sky-500 text-white' : 'bg-rose-600 text-white'} active:scale-95 shadow-xl`}
            >
              SALVAR PERFIL
            </button>
            <p className="text-center text-zinc-700 text-[7px] font-black uppercase tracking-widest italic">Limite de 1 Perfil Adulto e 1 Kids por conta.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSelection;
