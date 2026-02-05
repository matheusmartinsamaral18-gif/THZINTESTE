
import React from 'react';

interface VIPPreviewModalProps {
  onConfirm: () => void;
  onClose: () => void;
  isExpiredTrial?: boolean;
  isPersistentInterest?: boolean;
}

const VIPPreviewModal: React.FC<VIPPreviewModalProps> = ({ 
  onConfirm, 
  onClose, 
  isExpiredTrial = false,
  isPersistentInterest = false
}) => {
  return (
    <div className="fixed inset-0 z-[11000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/20 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/10 blur-[80px] rounded-full"></div>
        
        {/* Barra superior de destaque */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent shadow-[0_0_20px_rgba(225,29,72,0.6)]"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-rose-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-600/20">
            <span className="text-3xl">
              {isExpiredTrial ? '😢' : isPersistentInterest ? '👀' : '🔒'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            {isExpiredTrial 
              ? 'Seu teste terminou' 
              : isPersistentInterest 
                ? 'Parece que você quer muito assistir isso'
                : 'Conteúdo exclusivo VIP'
            }
          </h2>
          <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic">
            {isExpiredTrial 
              ? 'Continue com acesso total virando VIP.' 
              : isPersistentInterest
                ? 'Libere agora com o VIP e assista sem limites.'
                : <>Você tentou acessar um conteúdo exclusivo. <br/><span className="text-white/60">Esse item não está disponível no plano grátis.</span></>
            }
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 relative z-10">
          <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
            <span>🎬</span> O VIP LIBERA:
          </h3>
          <ul className="space-y-3">
            {[
              { icon: '📺', text: 'Canais de TV ao vivo' },
              { icon: '🍜', text: 'Animes completos' },
              { icon: '🎎', text: 'Doramas atualizados' },
              { icon: '🎞️', text: 'Sagas organizadas' }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[10px] font-black text-zinc-300 uppercase italic tracking-tighter">
                <span className="text-base grayscale-[0.5]">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {(!isExpiredTrial && !isPersistentInterest) && (
          <div className="text-center mb-8 relative z-10">
             <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest italic animate-pulse">
               Mais de 90% dos usuários assistem tudo com o VIP 👑
             </p>
          </div>
        )}

        <div className="space-y-3 relative z-10">
          <button 
            onClick={onConfirm}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest italic shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isExpiredTrial 
              ? '👑 ATIVAR VIP' 
              : isPersistentInterest 
                ? '👑 VIRAR VIP AGORA' 
                : <><span>🔥</span> DESBLOQUEAR AGORA</>
            }
          </button>
          {!isExpiredTrial && (
            <button 
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest italic transition-all flex items-center justify-center gap-2"
            >
              <span>⬅️</span> VOLTAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIPPreviewModal;
