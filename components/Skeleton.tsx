
import React, { useState, useEffect, useRef } from 'react';
import { PLANS, subscriptionService, getDeviceFingerprint } from '../services/subscriptionService';
import { Plan, Subscription } from '../types';

interface SubscriptionModalProps {
  userEmail: string;
  userName: string;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ userEmail, userName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'cancelled' | null>(null);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [showBannedDevice, setShowBannedDevice] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchSub = async () => {
      const sub = await subscriptionService.checkVipStatus(userEmail);
      setUserSubscription(sub);
    };
    fetchSub();
  }, [userEmail]);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'free_trial') {
      handleFreeTrialActivation(plan);
      return;
    }
    setSelectedPlan(plan);
  };

  const handleFreeTrialActivation = async (plan: Plan) => {
    if (userSubscription?.hasUsedFreeTrial) {
      alert("Sua conta de e-mail já utilizou o período de teste gratuito!");
      return;
    }

    setLoading(true);
    try {
      const deviceId = getDeviceFingerprint();
      const isBanned = await subscriptionService.isDeviceBannedFromTrial(deviceId);
      
      if (isBanned) {
        setShowBannedDevice(true);
        setLoading(false);
        return;
      }
      
      const activated = await subscriptionService.activateVip(userEmail, plan.id, 'free_trial_activation');
      if (activated) {
        setPaymentStatus('approved');
        setTimeout(() => { 
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      alert(`Erro ao ativar teste: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethod = async (method: 'pix' | 'card') => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      if (method === 'pix') {
        const payment = await subscriptionService.createPixPayment(userEmail, selectedPlan.id);
        if (payment && payment.point_of_interaction) {
          setPixData({
            id: payment.id,
            qrCode: payment.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
            planId: selectedPlan.id
          });
          setPaymentStatus('pending');
        }
      } else {
        const preference = await subscriptionService.createCheckoutPreference(userEmail, selectedPlan.id);
        if (preference && preference.init_point) {
          window.location.href = preference.init_point;
        }
      }
    } catch (err: any) {
      alert(`Erro no processamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentStatus === 'pending' && pixData?.id) {
      pollingRef.current = setInterval(async () => {
        try {
          const statusData = await subscriptionService.getPaymentStatus(pixData.id);
          if (statusData && statusData.status === 'approved') {
            setPaymentStatus('approved');
            if (pollingRef.current) clearInterval(pollingRef.current);
            await subscriptionService.activateVip(userEmail, pixData.planId, pixData.id);
            setTimeout(() => { 
              onClose();
            }, 1500);
          }
        } catch (err) { /* silent wait */ }
      }, 5000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [paymentStatus, pixData, userEmail, onClose]);

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      alert("CÓDIGO COPIADO!");
    }
  };

  if (showBannedDevice) {
    return (
      <div className="fixed inset-0 z-[12000] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 backdrop-blur-3xl">
        <div className="max-w-sm w-full bg-zinc-900/50 border border-white/5 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]"></div>
          <div className="w-20 h-20 bg-rose-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-600/20">
            <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">DISPOSITIVO <br/> <span className="text-rose-600">IDENTIFICADO</span></h2>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic mb-10">Ops! Identificamos que este aparelho já aproveitou os 7 dias grátis anteriormente. <br/><br/>Para continuar assistindo, escolha um de nossos planos VIP Ilimitados abaixo.</p>
          <button onClick={() => setShowBannedDevice(false)} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic shadow-xl shadow-rose-600/20 active:scale-95 transition-all">VER PLANOS DISPONÍVEIS</button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'approved') {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-8">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">ACESSO LIBERADO!</h2>
        <p className="text-zinc-500 font-bold uppercase text-[8px] tracking-[0.3em] italic">Bem-vindo ao ThCine Premium.</p>
      </div>
    );
  }

  if (pixData) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="w-full max-sm bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-rose-600"></div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">PAGAMENTO PIX</h2>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-8">O VIP é liberado na mesma hora</p>
          <div className="bg-white p-4 rounded-3xl mb-8 border-4 border-rose-600/10">
            <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="QR Code" className="w-44 h-44" />
          </div>
          <button onClick={copyToClipboard} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest mb-4 transition-all active:scale-95 shadow-lg shadow-rose-600/20">COPIAR CÓDIGO PIX</button>
          <button onClick={() => { setPixData(null); setPaymentStatus(null); setSelectedPlan(null); }} className="text-zinc-700 text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">Cancelar Pagamento</button>
        </div>
      </div>
    );
  }

  if (selectedPlan && !pixData) {
    return (
      <div className="fixed inset-0 z-[9500] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-300">
        <div className="w-full max-w-[340px] bg-[#0d0d0d] rounded-[3rem] border border-white/5 p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent opacity-50"></div>
          <div className="text-center mb-8">
            <h3 className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mb-2 italic">Você escolheu</h3>
            <span className="text-white text-lg font-black uppercase italic tracking-tighter">{selectedPlan.name}</span>
            <div className="flex items-start justify-center text-white mt-1">
              <span className="text-[10px] font-bold mt-1 mr-0.5 opacity-50">R$</span>
              <span className="text-3xl font-black tracking-tighter italic leading-none">{selectedPlan.price.toFixed(2).split('.')[0]}</span>
              <span className="text-[12px] font-black mt-0.5 opacity-50">.{selectedPlan.price.toFixed(2).split('.')[1]}</span>
            </div>
            <p className="mt-4 text-emerald-500 text-[9px] font-black uppercase tracking-widest italic leading-tight">Acesso ILIMITADO a tudo: <br/>Animes, Doramas, Novelas e Canais.</p>
          </div>
          <div className="w-full space-y-3">
            <button disabled={loading} onClick={() => handlePaymentMethod('pix')} className="group w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm1 14.5l-2.5-2.5 1.4-1.4 1.1 1.1 3.1-3.1 1.4 1.4-4.5 4.5z"/></svg>
              PAGAR COM PIX
            </button>
            <button disabled={loading} onClick={() => handlePaymentMethod('card')} className="w-full bg-zinc-900 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all hover:border-rose-600 active:scale-95 flex items-center justify-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 00-3 3z"/></svg>
              CARTÃO DE CRÉDITO
            </button>
          </div>
          <button onClick={() => setSelectedPlan(null)} className="mt-8 text-zinc-700 text-[8px] font-black uppercase tracking-widest hover:text-white transition-all italic underline underline-offset-4">Trocar de plano</button>
        </div>
      </div>
    );
  }

  const freeTrialPlan = PLANS.find(p => p.id === 'free_trial');
  const popularPlan = PLANS.find(p => p.id === '30_days');
  const otherPlans = PLANS.filter(p => p.id !== 'free_trial' && p.id !== '30_days');

  return (
    <div className="fixed inset-0 z-[9000] bg-black flex flex-col items-center justify-start overflow-y-auto custom-scrollbar animate-in fade-in duration-500 pb-20">
      {loading && (
        <div className="fixed inset-0 z-[11000] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
          <div className="w-10 h-10 border-2 border-rose-600/10 border-t-rose-600 rounded-full animate-spin mb-4"></div>
          <p className="text-[8px] font-black text-white uppercase tracking-[0.5em] italic animate-pulse">Processando...</p>
        </div>
      )}

      <div className="w-full max-w-[450px] px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">THCINE <span className="text-rose-600">PREMIUM</span></h1>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">ACESSO <span className="text-rose-600">VIP 👑</span></h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">
            Os planos pagos liberam acesso completo ao catálogo:<br/>
            Animes • Doramas • Novelas • Canais de TV
          </p>
        </div>

        <div className="h-[1px] w-full bg-white/5 mb-10"></div>

        {/* PLANO GRÁTIS */}
        {freeTrialPlan && !userSubscription?.hasUsedFreeTrial && (
          <div className="mb-12">
            <h3 className="text-sky-500 text-[10px] font-black uppercase tracking-widest italic mb-4 flex items-center gap-2">
              🆓 PLANO GRÁTIS
            </h3>
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-3xl p-6 flex flex-col items-center text-center">
              <span className="text-white text-lg font-black uppercase italic tracking-tighter mb-1">{freeTrialPlan.name}</span>
              <p className="text-zinc-500 text-[9px] font-bold uppercase italic mb-4">Teste premium gratuito (Categorias limitadas)</p>
              
              <ul className="text-left w-full space-y-2 mb-6 px-4">
                <li className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase italic">• Filmes e Séries</li>
                <li className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase italic">• Acesso parcial ao catálogo</li>
              </ul>

              <button 
                onClick={() => handleSelectPlan(freeTrialPlan)}
                className="w-full bg-sky-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic active:scale-95 transition-all shadow-lg shadow-sky-500/10"
              >
                ATIVAR TESTE
              </button>
            </div>
          </div>
        )}

        <div className="h-[1px] w-full bg-white/5 mb-10"></div>

        {/* PLANOS VIP */}
        <div className="space-y-12">
          <h3 className="text-rose-600 text-[10px] font-black uppercase tracking-widest italic mb-4 flex items-center gap-2">
            👑 PLANOS VIP
          </h3>

          {/* DESTAQUE 30 DIAS */}
          {popularPlan && (
            <div className="bg-rose-600/5 border-2 border-rose-600 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl shadow-rose-600/10">
              <div className="absolute top-0 right-[-20px] bg-rose-600 text-white text-[6px] font-black px-8 py-1 rotate-45 uppercase italic tracking-widest">TOP 1</div>
              <span className="text-white text-xl font-black uppercase italic tracking-tighter mb-1">⭐ {popularPlan.name} — R$ {popularPlan.price.toFixed(2).replace('.', ',')}</span>
              <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest italic mb-6">(Mais escolhido)</p>
              <p className="text-zinc-400 text-[10px] font-bold uppercase italic mb-6">Acesso completo e ilimitado a todo o catálogo</p>
              
              <ul className="text-left w-full space-y-3 mb-8 px-4">
                <li className="flex items-center gap-3 text-[10px] font-black text-zinc-200 uppercase italic">✔ Filmes e Séries</li>
                <li className="flex items-center gap-3 text-[10px] font-black text-zinc-200 uppercase italic">✔ 📺 Canais de TV ao vivo</li>
                <li className="flex items-center gap-3 text-[10px] font-black text-zinc-200 uppercase italic">✔ 🍜 Animes completos</li>
                <li className="flex items-center gap-3 text-[10px] font-black text-zinc-200 uppercase italic">✔ 🎎 Doramas atualizados</li>
                <li className="flex items-center gap-3 text-[10px] font-black text-zinc-200 uppercase italic">✔ 🎞️ Sagas organizadas</li>
              </ul>

              <button 
                onClick={() => handleSelectPlan(popularPlan)}
                className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic active:scale-95 transition-all shadow-xl shadow-rose-600/20"
              >
                ESCOLHER VIP
              </button>
            </div>
          )}

          {/* OUTROS PLANOS EM LISTA */}
          <div className="space-y-6">
            {otherPlans.map(plan => (
              <div key={plan.id} className="group">
                <div className="h-[1px] w-full bg-white/5 mb-8"></div>
                <div className="flex flex-col items-center text-center px-4">
                  <span className="text-white text-lg font-black uppercase italic tracking-tighter mb-1">
                    {plan.name} — R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase italic mb-4">Acesso completo e ilimitado</p>
                  {plan.id === '365_days' && <p className="text-amber-500 text-[8px] font-black uppercase italic mb-4">💰 Melhor custo-benefício</p>}
                  
                  <button 
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic group-hover:bg-white group-hover:text-black transition-all active:scale-95"
                  >
                    ESCOLHER VIP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[1px] w-full bg-white/5 mt-12 mb-10"></div>

        {/* FOOTER DO MODAL */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap justify-center gap-6">
            <span className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase italic tracking-tighter">✔ Pagamento seguro</span>
            <span className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase italic tracking-tighter">✔ Acesso liberado imediatamente</span>
            <span className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase italic tracking-tighter">✔ Suporte disponível</span>
          </div>

          <button 
            onClick={onClose} 
            className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.4em] hover:text-rose-500 transition-all italic mt-4"
          >
            Sair sem assinar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
