import React, { useState, useCallback } from 'react';
import { Dice } from './components/Dice';
import { getRollCommentary } from './services/gemini';
import { GeminiCommentary } from './types';
import { Flame, Sparkles, Wand2, History, BookOpen, Zap, ShieldAlert, Target, Box } from 'lucide-react';

type RollMode = 'standard' | 'catalyst' | 'inhibitor' | 'damage';

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [mode, setMode] = useState<RollMode>('standard');
  const [diceValues, setDiceValues] = useState<number[]>([6, 6]);
  const [extraDice, setExtraDice] = useState<number | null>(null);
  const [discardedIndex, setDiscardedIndex] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [commentary, setCommentary] = useState<GeminiCommentary | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  const rollDice = useCallback(async () => {
    if (isRolling) return;

    setIsRolling(true);
    setCommentary(null);
    setExtraDice(null);
    setDiscardedIndex(null);

    const isThreeDice = mode === 'catalyst' || mode === 'inhibitor';
    const isSingleDie = mode === 'damage';

    const interval = setInterval(() => {
      if (isSingleDie) {
        setDiceValues([Math.floor(Math.random() * 6) + 1]);
      } else {
        setDiceValues([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]);
        if (isThreeDice) setExtraDice(Math.floor(Math.random() * 6) + 1);
      }
    }, 70);

    setTimeout(async () => {
      clearInterval(interval);
      
      let d1 = Math.floor(Math.random() * 6) + 1;
      let d2 = !isSingleDie ? Math.floor(Math.random() * 6) + 1 : 0;
      let d3 = isThreeDice ? Math.floor(Math.random() * 6) + 1 : null;

      let finalValues = [d1];
      if (!isSingleDie) finalValues.push(d2);
      if (d3 !== null) finalValues.push(d3);

      let total = 0;
      let discarded: number | null = null;

      if (mode === 'catalyst' && d3 !== null) {
        const sorted = [...finalValues].sort((a, b) => b - a);
        total = sorted[0] + sorted[1];
        discarded = sorted[2];
        const minVal = Math.min(...finalValues);
        setDiscardedIndex(finalValues.indexOf(minVal));
        setDiceValues(finalValues.slice(0, 2));
        setExtraDice(d3);
      } else if (mode === 'inhibitor' && d3 !== null) {
        const sorted = [...finalValues].sort((a, b) => a - b);
        total = sorted[0] + sorted[1];
        discarded = sorted[2];
        const maxVal = Math.max(...finalValues);
        setDiscardedIndex(finalValues.indexOf(maxVal));
        setDiceValues(finalValues.slice(0, 2));
        setExtraDice(d3);
      } else if (mode === 'damage') {
        total = d1;
        setDiceValues([d1]);
      } else {
        total = d1 + d2;
        setDiceValues([d1, d2]);
      }

      setIsRolling(false);
      setHistory(prev => [total, ...prev].slice(0, 5));

      setIsLoadingCommentary(true);
      // Para o modo dano, passamos d2 como 0
      const aiResponse = await getRollCommentary(d1, d2, mode, discarded || undefined);
      setCommentary(aiResponse);
      setIsLoadingCommentary(false);
    }, 1200);
  }, [isRolling, mode]);

  const currentSum = history.length > 0 && !isRolling ? history[0] : (diceValues[0] + (diceValues[1] || 0));

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
    <div className="h-screen w-screen flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden bg-radial-at-c from-[#2d1b14] to-[#130b08]">
      
      <header className="relative z-20 w-full max-w-md pt-4 text-center">
        <div className="mb-4">
          <h1 className="font-alchemy text-3xl text-amber-500 tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">ALCHEMIA</h1>
          <p className="font-alchemy text-[8px] text-amber-200/30 uppercase tracking-[0.4em]">Codex de Reação</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2 bg-black/60 rounded-2xl border border-amber-500/10 shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => { setMode('standard'); setDiceValues([6, 6]); setExtraDice(null); }} 
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-alchemy text-[10px] uppercase tracking-widest border ${
              mode === 'standard' 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'text-amber-500/30 border-transparent hover:bg-white/5'
            }`}
          >
            <Box size={14}/> <span>Padrão</span>
          </button>
          
          <button 
            onClick={() => { setMode('catalyst'); setDiceValues([6, 6]); setExtraDice(6); }} 
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-alchemy text-[10px] uppercase tracking-widest border ${
              mode === 'catalyst' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                : 'text-amber-500/30 border-transparent hover:bg-white/5'
            }`}
          >
            <Zap size={14}/> <span>Catalisador</span>
          </button>

          <button 
            onClick={() => { setMode('inhibitor'); setDiceValues([6, 6]); setExtraDice(6); }} 
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-alchemy text-[10px] uppercase tracking-widest border ${
              mode === 'inhibitor' 
                ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'text-amber-500/30 border-transparent hover:bg-white/5'
            }`}
          >
            <ShieldAlert size={14}/> <span>Inibidor</span>
          </button>

          <button 
            onClick={() => { setMode('damage'); setDiceValues([6]); setExtraDice(null); }} 
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-alchemy text-[10px] uppercase tracking-widest border ${
              mode === 'damage' 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                : 'text-amber-500/30 border-transparent hover:bg-white/5'
            }`}
          >
            <Target size={14}/> <span>Dano</span>
          </button>
        </div>
      </header>

      <div className="relative z-0 flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
          <div className={`pointer-events-none absolute -inset-32 rounded-full blur-[120px] transition-all duration-1000 ${
            isRolling ? 'bg-amber-600/10 scale-90' : 
            currentSum >= 10 ? 'bg-yellow-400/20 scale-110' : 
            currentSum <= 3 ? 'bg-red-900/30 scale-110' : 'bg-amber-500/5 scale-100'
          }`}></div>
          
          <div className="relative flex gap-4 md:gap-8 items-center justify-center">
            <div className={`transition-all duration-500 ${discardedIndex === 0 ? 'opacity-20 grayscale scale-75' : ''}`}>
              <Dice value={diceValues[0]} isRolling={isRolling} />
            </div>
            
            {/* O segundo dado só aparece se não estivermos no modo Dano */}
            {mode !== 'damage' && diceValues[1] !== undefined && (
              <div className={`transition-all duration-500 ${discardedIndex === 1 ? 'opacity-20 grayscale scale-75' : ''}`}>
                <Dice value={diceValues[1]} isRolling={isRolling} />
              </div>
            )}
            
            {extraDice !== null && mode !== 'damage' && (
              <div className={`transition-all duration-500 ${discardedIndex === 2 ? 'opacity-20 grayscale scale-75' : ''}`}>
                <Dice value={extraDice} isRolling={isRolling} />
              </div>
            )}
          </div>
          
          {!isRolling && history.length > 0 && (
            <div className="absolute -bottom-16 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
               <p className="text-[10px] font-alchemy text-amber-200/40 uppercase tracking-[0.4em]">
                {mode === 'damage' ? 'Impacto Destrutivo' : 'Magnitude da Reação'}
               </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-sm flex flex-col gap-6 pb-8">
        <div className="h-28 flex items-center justify-center text-center px-6 bg-black/40 rounded-3xl border border-amber-500/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          {isLoadingCommentary ? (
            <div className="flex items-center gap-3 text-amber-400/60 animate-pulse text-[10px] font-alchemy uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              Decifrando Éter...
            </div>
          ) : commentary ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <p className="text-xs md:text-sm italic font-alchemy text-amber-50/90 leading-relaxed tracking-wide">
                "{commentary.text}"
              </p>
            </div>
          ) : !isRolling && (
            <div className="text-amber-200/10 flex flex-col items-center gap-2 font-alchemy text-[9px] uppercase tracking-[0.5em]">
               <Wand2 className="w-4 h-4 opacity-50" /> Laboratório em {mode.toUpperCase()}
            </div>
          )}
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling}
          className={`
            group relative overflow-hidden w-full py-6 rounded-3xl text-lg font-alchemy font-black transition-all
            shadow-[0_20px_50px_rgba(0,0,0,0.7)] active:scale-95
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