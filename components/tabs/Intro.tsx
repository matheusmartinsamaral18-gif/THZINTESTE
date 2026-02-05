
import React, { useEffect, useState, useCallback } from 'react';
import PosterWall from './PosterWall';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let finish: ReturnType<typeof setTimeout>;

    // Inicia saída após 2.5s
    timer = setTimeout(() => {
      setIsExiting(true);
      // Finaliza 0.8s depois
      finish = setTimeout(() => {
        onComplete();
      }, 800);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <style>
        {`
          @keyframes reveal-logo {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          }
          .animate-reveal { animation: reveal-logo 1.5s cubic-bezier(0.2, 1, 0.3, 1) forwards; }
          .glow-th { filter: drop-shadow(0 0 30px rgba(225, 29, 72, 0.5)); }
        `}
      </style>
      
      <div className="absolute inset-0 z-0">
        <PosterWall />
      </div>

      <div className="absolute inset-0 bg-black/50 z-[5] backdrop-blur-[3px]"></div>
      
      <div className={`relative z-10 flex flex-col items-center gap-6 ${isExiting ? 'animate-pulse' : 'animate-reveal'}`}>
        <div className="relative">
          <img 
            src="https://raw.githubusercontent.com/matheusmartinsamaral19-code/Imagems/0457a185efb19be123610e7c50188994b9aa9938/IMG-20260114-WA0080.jpg" 
            alt="Logo" 
            className="w-28 h-28 rounded-[2.2rem] border-2 border-rose-600/40 glow-th shadow-2xl"
          />
          <div className="absolute -inset-8 bg-rose-600/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
        </div>
        
        <div className="text-center">
          <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl">
            TH<span className="text-rose-600">CINE</span>
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-rose-600 to-transparent mx-auto mt-2 rounded-full opacity-60"></div>
          <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.5em] mt-6 italic">Premium Streaming</p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
