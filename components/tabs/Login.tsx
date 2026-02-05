
import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebaseService';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import PosterWall from './PosterWall';

interface LoginProps {
  onLogin: (id: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        onLogin(user.email);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) onLogin(result.user.email);
    } catch (err: any) {
      setError('Erro ao entrar com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Link de recuperação enviado ao seu e-mail!');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err: any) {
      setError('Erro ao enviar. Verifique se o e-mail está cadastrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (isRegistering && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user.email) onLogin(userCredential.user.email);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.email) onLogin(userCredential.user.email);
      }
    } catch (err: any) {
      console.error("Auth Error Code:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        if (!isRegistering) {
          setError('Conta não encontrada ou dados incorretos. Você precisa se cadastrar primeiro.');
        } else {
          setError('Dados inválidos para cadastro.');
        }
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta. Tente novamente ou recupere sua senha.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já possui uma conta. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black p-4 overflow-hidden">
      <PosterWall />
      
      {/* Container Principal - Tamanho reduzido para 310px */}
      <div className="relative w-full max-w-[310px] z-10 bg-white/[0.05] backdrop-blur-[40px] border border-white/10 p-7 rounded-[2.2rem] shadow-[0_35px_100px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[95vh] no-scrollbar animate-in fade-in zoom-in duration-700">
        
        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-rose-600/30 bg-black mb-3 shadow-2xl transition-transform hover:scale-110 duration-500">
            <img src="https://raw.githubusercontent.com/matheusmartinsamaral19-code/Imagems/0457a185efb19be123610e7c50188994b9aa9938/IMG-20260114-WA0080.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic text-glow tracking-tighter">TH<span className="text-rose-600">CINE</span></h1>
          <p className="text-white/40 text-[7px] mt-0.5 font-black uppercase tracking-[0.4em] italic">Premium Experience</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-[8px] font-black uppercase text-center leading-tight italic border bg-rose-500/10 text-rose-500 border-rose-500/20 animate-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-xl text-[8px] font-black uppercase text-center italic border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-white/30 tracking-widest italic ml-1">E-mail</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full h-11 bg-white/[0.05] border border-white/10 rounded-xl px-4 text-white text-xs focus:border-rose-600 focus:bg-white/[0.08] transition-all outline-none placeholder:text-zinc-700" 
              placeholder="seu@email.com" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-white/30 tracking-widest italic ml-1">Senha</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full h-11 bg-white/[0.05] border border-white/10 rounded-xl px-4 pr-12 text-white text-xs focus:border-rose-600 focus:bg-white/[0.08] transition-all outline-none placeholder:text-zinc-700" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L14.59 5.17m-4.59 4.59L5.17 14.59M21 12a9.958 9.958 0 01-4.512 8.332M15.812 4.11A9.962 9.962 0 0121 12h-2.25"/></svg>
                )}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1 animate-in fade-in duration-300">
              <label className="text-[8px] font-black uppercase text-white/30 tracking-widest italic ml-1">Confirmar</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full h-11 bg-white/[0.05] border border-white/10 rounded-xl px-4 text-white text-xs focus:border-rose-600 focus:bg-white/[0.08] outline-none" 
                placeholder="••••••••" 
              />
            </div>
          )}

          {!isRegistering && (
            <div className="flex justify-end">
              <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black uppercase text-zinc-300 hover:text-white hover:underline transition-all tracking-widest italic decoration-rose-600/50">Esqueceu a senha?</button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 rounded-xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-[0.2em] italic shadow-2xl shadow-rose-600/30 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 transition-all mt-2"
          >
            {isLoading ? "CARREGANDO..." : isRegistering ? "CADASTRAR" : "ENTRAR"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 relative z-10">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-zinc-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google Login
          </button>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            className="text-white/40 text-[8px] font-black uppercase tracking-widest hover:text-white italic transition-colors"
          >
            {isRegistering ? "Voltar ao Login" : "Criar Nova Conta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
