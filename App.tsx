import React, { useState, useCallback } from 'react';
import { Dice } from './components/Dice';
import { getRollCommentary } from './services/gemini';
import { GeminiCommentary } from './types';
import { Flame, Sparkles, Wand2, History, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([6, 6]);
  const [isRolling, setIsRolling] = useState(false);
  const [commentary, setCommentary] = useState<GeminiCommentary | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  const rollDice = useCallback(async () => {
    if (isRolling) return;

    setIsRolling(true);
    setCommentary(null);

    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 70);

    setTimeout(async () => {
      clearInterval(interval);
      
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;

      setDiceValues([d1, d2]);
      setIsRolling(false);
      setHistory(prev => [total, ...prev].slice(0, 5));

      setIsLoadingCommentary(true);
      const aiResponse = await getRollCommentary(d1, d2, 'standard');
      setCommentary(aiResponse);
      setIsLoadingCommentary(false);
    }, 1000);
  }, [isRolling]);

  const currentSum = diceValues[0] + diceValues[1];

  if (!hasEntered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#1a0f0a]">
        <div className="mb-8 animate-pulse">
           <div className="w-16 h-1 w-16 bg-amber-500/20 mx-auto mb-4 blur-sm"></div>
           <h1 className="font-alchemy text-5xl text-amber-500 mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">ALCHEMIA</h1>
           <p className="font-alchemy text-[10px] text-amber-200/40 uppercase tracking-[0.5em]">Codex de Reação</p>
        </div>
        
        <button 
          onClick={() => setHasEntered(true)}
          className="group flex flex-col items-center gap-4 px-12 py-10 rounded-3xl border border-amber-500/20 bg-black/40 backdrop-blur-xl hover:border-amber-500/60 transition-all shadow-[0_0_50px_rgba(0,0,0,0.8)] active:scale-95"
        >
          <BookOpen className="w-10 h-10 text-amber-500 group-hover:scale-125 transition-transform duration-500" />
          <span className="font-alchemy text-xs tracking-[0.3em] text-amber-200 uppercase">Acessar Laboratório</span>
        </button>
        
        <p className="fixed bottom-8 text-amber-500/10 font-alchemy text-[8px] uppercase tracking-widest">Propriedade da Ordem</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between p-6 overflow-hidden">
      <div className="text-center pt-2">
        <h2 className="font-alchemy text-xl text-amber-500/80 font-bold tracking-widest">ALCHEMIA</h2>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-1"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
          {/* Brilho de Fundo Dinâmico */}
          <div className={`absolute -inset-32 rounded-full blur-[120px] transition-all duration-1000 ${
            isRolling ? 'bg-amber-600/10 scale-90' : 
            currentSum >= 10 ? 'bg-yellow-400/30 scale-110' : 
            currentSum <= 3 ? 'bg-red-900/40 scale-110' : 'bg-amber-500/10 scale-100'
          }`}></div>
          
          <div className="relative flex gap-8 items-center">
            <Dice value={diceValues[0]} isRolling={isRolling} />
            <div className="text-amber-500/20 font-alchemy text-4xl font-black">/</div>
            <Dice value={diceValues[1]} isRolling={isRolling} />
          </div>

          {!isRolling && (
            <div className="absolute -bottom-24 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
               <span className={`font-alchemy text-7xl font-black drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] ${
                 currentSum === 12 ? 'text-yellow-200' : currentSum === 2 ? 'text-red-500' : 'text-amber-500'
               }`}>
                 {currentSum}
               </span>
               <p className="text-[10px] font-alchemy text-amber-200/40 uppercase tracking-[0.4em] mt-3">Magnitude da Reação</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6 pb-8">
        {/* Caixa de Comentário do Mestre */}
        <div className="h-28 flex items-center justify-center text-center px-6 bg-black/40 rounded-3xl border border-amber-500/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          {isLoadingCommentary ? (
            <div className="flex items-center gap-3 text-amber-400/60 animate-pulse text-[10px] font-alchemy uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Decifrando Éter...
            </div>
          ) : commentary ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <p className="text-xs md:text-sm italic font-alchemy text-amber-50/90 leading-relaxed tracking-wide">
                "{commentary.text}"
              </p>
            </div>
          ) : !isRolling && (
            <div className="text-amber-200/10 flex flex-col items-center gap-2 font-alchemy text-[9px] uppercase tracking-[0.5em]">
               <Wand2 className="w-4 h-4 opacity-50" /> Laboratório Pronto
            </div>
          )}
        </div>

        {/* Botão Principal */}
        <button
          onClick={rollDice}
          disabled={isRolling}
          className={`
            group relative overflow-hidden w-full py-6 rounded-3xl text-lg font-alchemy font-black transition-all
            shadow-[0_20px_50px_rgba(0,0,0,0.7)] active:scale-90
            ${isRolling 
              ? 'bg-amber-950/20 text-amber-900/40 border border-amber-900/20 cursor-not-allowed' 
              : 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 text-amber-950 border-t border-amber-200/50 hover:brightness-110'}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            {isRolling ? (
              <span className="animate-pulse tracking-[0.3em] uppercase text-sm">Transmutando...</span>
            ) : (
              <>
                <Flame className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
                <span className="tracking-[0.2em] uppercase">Rolar Reação</span>
              </>
            )}
          </div>
        </button>

        {/* Histórico Discreto */}
        {history.length > 0 && (
          <div className="flex items-center justify-center gap-4 py-2 opacity-30">
            <History className="w-3 h-3 text-amber-200" />
            <div className="flex gap-3">
              {history.map((val, i) => (
                <span key={i} className={`text-[10px] font-bold font-alchemy ${i === 0 ? 'text-amber-400' : 'text-amber-100'}`}>
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;