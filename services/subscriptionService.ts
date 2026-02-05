import { db } from './firebaseService';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { Subscription, Plan } from '../types';

const MP_ACCESS_TOKEN = 'APP_USR-2989723818850143-011423-e34090c1386086e2ca8c3da40b63ebe2-443148603';
const PROXY_URL = 'https://corsproxy.io/?'; 

export const PLANS: Plan[] = [
  { id: 'free_trial', name: '7 Dias Grátis', price: 0.00, durationDays: 7, description: 'Teste Premium Gratuito (Categorias Limitadas)' },
  { id: '7_days', name: 'VIP 7 Dias', price: 7.90, durationDays: 7, description: 'Acesso Semanal Ilimitado' },
  { id: '15_days', name: 'VIP 15 Dias', price: 12.90, durationDays: 15, description: 'Acesso Quinzenal Ilimitado' },
  { id: '30_days', name: 'VIP 30 Dias', price: 19.90, durationDays: 30, description: 'Plano Popular Ilimitado' },
  { id: '90_days', name: 'VIP 3 Meses', price: 49.90, durationDays: 90, description: 'Combo Trimestral Ilimitado' },
  { id: '180_days', name: 'VIP 6 Meses', price: 89.90, durationDays: 180, description: 'Semestre Premium Ilimitado' },
  { id: '365_days', name: 'VIP 1 Ano', price: 149.90, durationDays: 365, description: 'Elite Anual Ilimitado' },
];

const getSubscriptionDocId = (email: string) => {
  return email.toLowerCase().trim().replace(/\./g, '_');
};

/**
 * Gera um ID único para o aparelho baseado em características do hardware e navegador.
 */
export const getDeviceFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const components = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 'cpu-unk',
    (nav as any).deviceMemory || 'mem-unk'
  ];
  
  const str = components.join('||');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'DEVICE_' + Math.abs(hash).toString(36).toUpperCase();
};

export const subscriptionService = {
  checkVipStatus: async (email: string): Promise<Subscription | null> => {
    if (!email) return null;
    try {
      const docId = getSubscriptionDocId(email);
      const docRef = doc(db, "user_subscriptions", docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        let expiry = 0;
        if (data.expiryDate instanceof Timestamp) {
          expiry = data.expiryDate.toMillis();
        } else if (typeof data.expiryDate === 'number') {
          expiry = data.expiryDate;
        } else if (data.expiryDate?.seconds) {
          expiry = data.expiryDate.seconds * 1000;
        }

        const sub: Subscription = {
          planType: data.planType || 'VIP Manual',
          startDate: data.startDate || Date.now(),
          expiryDate: expiry,
          status: data.status || 'active',
          paymentId: data.paymentId || 'manual',
          hasUsedFreeTrial: !!data.hasUsedFreeTrial,
          trialUsageCount: data.trialUsageCount || 0,
          lastUsageDate: data.lastUsageDate || ''
        };
        
        return sub;
      }
    } catch (e) {
      console.error("Erro ao verificar VIP:", e);
    }
    return null;
  },

  isDeviceBannedFromTrial: async (deviceId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "trial_devices", deviceId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      console.error("Erro ao verificar dispositivo:", e);
      return false;
    }
  },

  incrementTrialUsage: async (email: string, currentSub: Subscription) => {
    if (currentSub.planType !== '7 Dias Grátis') return;

    const today = new Date().toISOString().split('T')[0];
    const docId = getSubscriptionDocId(email);
    const docRef = doc(db, "user_subscriptions", docId);

    let newCount = (currentSub.lastUsageDate === today) ? (currentSub.trialUsageCount || 0) + 1 : 1;

    try {
      await updateDoc(docRef, {
        trialUsageCount: newCount,
        lastUsageDate: today
      });
    } catch (e) {
      console.error("Erro ao atualizar uso do trial:", e);
    }
  },

  activateVip: async (email: string, planId: string, paymentId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return null;

    const currentSub = await subscriptionService.checkVipStatus(email);
    const now = Date.now();
    const baseTime = (currentSub && currentSub.expiryDate > now) ? currentSub.expiryDate : now;
    
    const expiryDate = baseTime + (plan.durationDays * 24 * 60 * 60 * 1000);
    const subData: any = {
      planType: plan.name,
      startDate: now,
      expiryDate,
      status: 'active',
      paymentId: paymentId?.toString() || 'manual'
    };

    if (planId === 'free_trial') {
      const deviceId = getDeviceFingerprint();
      subData.hasUsedFreeTrial = true;
      subData.trialUsageCount = 0;
      subData.lastUsageDate = new Date().toISOString().split('T')[0];
      subData.registeredDeviceId = deviceId;

      try {
        const deviceRef = doc(db, "trial_devices", deviceId);
        await setDoc(deviceRef, {
          usedBy: email,
          usedAt: now,
          plan: planId
        });
      } catch (e) {
        console.error("Erro ao registrar dispositivo:", e);
      }
    }

    const docId = getSubscriptionDocId(email);
    const docRef = doc(db, "user_subscriptions", docId);
    
    try {
      await setDoc(docRef, subData, { merge: true });
      return { ...subData, hasUsedFreeTrial: subData.hasUsedFreeTrial || currentSub?.hasUsedFreeTrial } as Subscription;
    } catch (e) {
      console.error("Erro ao salvar VIP:", e);
      return null;
    }
  },

  createPixPayment: async (email: string, planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    try {
      const apiUrl = 'https://api.mercadopago.com/v1/payments';
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `pix-${Date.now()}`
        },
        body: JSON.stringify({
          transaction_amount: plan.price,
          description: `ThCine VIP - ${plan.name}`,
          payment_method_id: 'pix',
          payer: {
            email: email.trim(),
            first_name: 'Usuario',
            last_name: 'ThCine',
            identification: { type: 'CPF', number: '19119119100' }
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro na API');
      return data;
    } catch (error: any) {
      console.error("Erro ao criar PIX:", error);
      throw error;
    }
  },

  createCheckoutPreference: async (email: string, planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    try {
      const apiUrl = 'https://api.mercadopago.com/checkout/preferences';
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{ id: plan.id, title: `ThCine VIP - ${plan.name}`, quantity: 1, currency_id: 'BRL', unit_price: plan.price }],
          payer: { email: email.trim() },
          back_urls: { success: window.location.origin, failure: window.location.origin, pending: window.location.origin },
          auto_return: 'approved',
          external_reference: `${email}|${planId}`
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro na API');
      return data;
    } catch (error) {
      console.error("Erro ao criar preferência:", error);
      throw error;
    }
  },

  getPaymentStatus: async (paymentId: string) => {
    try {
      const apiUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      return null;
    }
  }
};
