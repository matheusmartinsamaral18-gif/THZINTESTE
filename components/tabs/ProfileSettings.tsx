
import React from 'react';

interface ProfileSettingsProps {
  onSwitchProfile: () => void;
  onManageProfiles: () => void;
  onSignOut: () => void;
  onClose: () => void;
  isKids?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSwitchProfile, onManageProfiles, onSignOut, onClose, isKids }) => {
  return (
    <div className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`w-full max-w-sm ${isKids ? 'bg-[#001a33]' : 'bg-[#0d0d0d]'} border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isKids ? 'bg-sky-500/10 text-sky-500' : 'bg-rose-600/10 text-rose-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-black uppercase italic tracking-tighter text-lg">Ajustes</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onSwitchProfile}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-xs font-black uppercase italic tracking-widest text-zinc-300 group-hover:text-white">Trocar Perfil</span>
            </div>
            <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>

          <button 
            onClick={onManageProfiles}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span className="text-xs font-black uppercase italic tracking-widest text-zinc-300 group-hover:text-white">Gerenciar Perfis</span>
            </div>
            <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>

          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-rose-600/5 border border-rose-600/10 hover:bg-rose-600/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 text-rose-500/50 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-xs font-black uppercase italic tracking-widest text-rose-500/80 group-hover:text-rose-500">Sair da Conta</span>
            </div>
            <svg className="w-4 h-4 text-rose-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <p className="mt-8 text-center text-zinc-800 text-[7px] font-black uppercase tracking-[0.3em] italic">ThCine Premium • Versão 4.0.2</p>
      </div>
    </div>
  );
};

export default ProfileSettings;
