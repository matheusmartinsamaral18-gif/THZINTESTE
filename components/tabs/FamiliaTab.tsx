import React from 'react';
const FamiliaTab: React.FC<{ onItemClick: (item: any) => void }> = () => (
  <div className="px-4 md:px-12 py-6 animate-in fade-in duration-700">
    <div className="flex items-center gap-4 mb-12"><div className="h-10 w-1 bg-rose-600 rounded-full"></div><h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">CATÁLOGO <span className="text-rose-600">FAMÍLIA</span></h1></div>
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-zinc-600"><p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Conteúdo sendo sincronizado...</p></div>
  </div>
);
export default FamiliaTab;