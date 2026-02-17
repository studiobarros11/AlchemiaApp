
import React, { useState, useCallback, useEffect } from 'react';
import { Dice } from './components/Dice';
import { getRollCommentary } from './services/gemini';
import { RollResult, GeminiCommentary } from './types';
import { History, RotateCcw, Flame, Sparkles, Wand2, ShieldAlert, Award, Zap, Ban, CircleDot, BookOpen, Lock, Sword } from 'lucide-react';

type RollMode = 'standard' | 'catalyst' | 'inhibitor' | 'damage';

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [discardedIndex, setDiscardedIndex] = useState<number | null>(null);
  const [rollMode, setRollMode] = useState<RollMode>('standard');
  const [isRolling, setIsRolling] = useState(false);
  const [commentary, setCommentary] = useState<GeminiCommentary | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  useEffect(() => {
    if (!isRolling && hasEntered) {
      const numDice = rollMode === 'standard' ? 2 : rollMode === 'damage' ? 1 : 3;
      setDiceValues(Array(numDice).fill(1));
      setDiscardedIndex(null);
      setCommentary(null);
    }
  }, [rollMode, hasEntered]);

  const rollDice = useCallback(async () => {
    if (isRolling) return;

    setIsRolling(true);
    setCommentary(null);
    setDiscardedIndex(null);

    const numDice = rollMode === 'standard' ? 2 : rollMode === 'damage' ? 1 : 3;

    const interval = setInterval(() => {
      setDiceValues(Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1));
    }, 80);

    setTimeout(async () => {
      clearInterval(interval);
      const rawRolls = Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1);
      
      let finalDiceIndices: number[] = [];
      let discIndex: number | null = null;

      if (rollMode === 'standard') {
        finalDiceIndices = [0, 1];
      } else if (rollMode === 'damage') {
        finalDiceIndices = [0];
      } else {
        if (rollMode === 'catalyst') {
          let minVal = Math.min(...rawRolls);
          discIndex = rawRolls.indexOf(minVal);
        } else {
          let maxVal = Math.max(...rawRolls);
          discIndex = rawRolls.indexOf(maxVal);
        }
        finalDiceIndices = [0, 1, 2].filter(i => i !== discIndex);
      }

      setDiceValues(rawRolls);
      setDiscardedIndex(discIndex);
      setIsRolling(false);
      
      const d1 = rawRolls[finalDiceIndices[0]];
      const d2 = rollMode === 'damage' ? 0 : rawRolls[finalDiceIndices[1]];
      
      const newRoll: RollResult = {
        dice1: d1,
        dice2: d2,
        timestamp: new Date()
      };
      setHistory(prev => [newRoll, ...prev].slice(0, 10));

      setIsLoadingCommentary(true);
      const aiResponse = await getRollCommentary(d1, d2, rollMode, discIndex !== null ? rawRolls[discIndex] : undefined);
      setCommentary(aiResponse);
      setIsLoadingCommentary(false);
    }, 1000);
  }, [isRolling, rollMode]);

  const getActiveSum = () => {
    if (isRolling) return null;
    if (rollMode === 'damage') return diceValues[0];
    if (discardedIndex === null) return diceValues[0] + diceValues[1];
    const activeValues = diceValues.filter((_, i) => i !== discardedIndex);
    return activeValues[0] + activeValues[1];
  };

  const currentSum = getActiveSum();
  const isGasNobre = rollMode !== 'damage' && currentSum === 12 && !isRolling;
  const isIsotopoInstavel = rollMode !== 'damage' && currentSum === 2 && !isRolling;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'lucky': return 'text-amber-300';
      case 'amazing': return 'text-yellow-200 font-bold drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]';
      case 'unlucky': return 'text-orange-900 font-bold';
      default: return 'text-amber-100/90';
    }
  };

  const LogoComponent = ({ sizeClasses }: { sizeClasses: string }) => {
    if (logoFailed) {
      return (
        <div className="flex flex-col items-center">
          <h1 className="font-alchemy text-3xl md:text-4xl text-amber-400 text-center font-bold tracking-tighter drop-shadow-lg">ALCHEMIA</h1>
          <p className="font-alchemy text-[8px] text-amber-100/60 text-center uppercase tracking-[0.4em] mt-1">A ordem dos elementos</p>
        </div>
      );
    }
    return (
      <img 
        src="https://img.imageboss.me/constant/width/800/raw/00/01/logo-alchemia.png" 
        alt="Alchemia" 
        className={sizeClasses}
        onError={() => setLogoFailed(true)}
      />
    );
  };

  if (!hasEntered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center transition-opacity duration-1000 overflow-hidden">
        <div className="w-56 md:w-72 mb-8 drop-shadow-[0_0_40px_rgba(251,191,36,0.3)]">
          <LogoComponent sizeClasses="w-full h-auto" />
        </div>
        <div className="font-alchemy text-amber-500/60 text-[10px] tracking-[0.5em] mb-3 uppercase">Suplemento Digital Oficial</div>
        <h1 className="font-alchemy text-xl text-amber-100 mb-6 tracking-tighter uppercase">O Codex de Reação</h1>
        <p className="text-amber-200/40 text-[11px] max-w-xs mb-8 leading-relaxed font-light italic">
          "Na natureza, nada se cria, nada se perde, tudo se transforma."
        </p>
        <button 
          onClick={() => setHasEntered(true)}
          className="group relative flex flex-col items-center gap-4 px-12 py-6 rounded-full border border-amber-500/20 bg-black/40 backdrop-blur-md hover:bg-amber-900/20 transition-all duration-500 shadow-2xl"
        >
          <div className="absolute -inset-1 bg-amber-500/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <BookOpen className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-alchemy text-xs tracking-[0.2em] text-amber-200 uppercase">Acessar Laboratório</span>
        </button>
        <div className="mt-10 flex items-center gap-2 text-amber-900/40 text-[9px] uppercase tracking-widest font-alchemy">
          <Lock className="w-3 h-3" /> Propriedade da Ordem
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-between p-4 pt-6 pb-4 transition-all duration-700 ease-out opacity-100 overflow-hidden">
      {/* Logo Alchemia Principal */}
      <div className="flex flex-col items-center shrink-0">
        <div className="max-w-[180px] md:max-w-[280px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
           <LogoComponent sizeClasses="w-full h-auto" />
        </div>
      </div>

      {/* Seletor de Modo de Teste */}
      <div className="flex bg-black/50 p-1 rounded-xl border border-amber-500/30 backdrop-blur-md shadow-lg scale-[0.8] md:scale-90 shrink-0">
        <div className="flex">
          <button onClick={() => setRollMode('standard')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-alchemy text-[9px] font-bold transition-all ${rollMode === 'standard' ? 'bg-amber-600 text-amber-50' : 'text-amber-200/40 hover:text-amber-400'}`}>
            <CircleDot className="w-3 h-3" /> PADRÃO
          </button>
          <button onClick={() => setRollMode('catalyst')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-alchemy text-[9px] font-bold transition-all ${rollMode === 'catalyst' ? 'bg-yellow-500 text-yellow-950' : 'text-amber-200/40 hover:text-amber-400'}`}>
            <Zap className="w-3 h-3" /> CATALISADOR
          </button>
          <button onClick={() => setRollMode('inhibitor')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-alchemy text-[9px] font-bold transition-all ${rollMode === 'inhibitor' ? 'bg-purple-900 text-purple-100 border border-purple-500/30' : 'text-amber-200/40 hover:text-amber-400'}`}>
            <Ban className="w-3 h-3" /> INIBIDOR
          </button>
          <button onClick={() => setRollMode('damage')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-alchemy text-[9px] font-bold transition-all ${rollMode === 'damage' ? 'bg-red-800 text-red-50' : 'text-amber-200/40 hover:text-red-400'}`}>
            <Sword className="w-3 h-3" /> DANO
          </button>
        </div>
      </div>

      {/* Indicadores e Arena */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 overflow-hidden">
        <div className="h-6 flex items-center justify-center shrink-0 mb-2">
          {isGasNobre && <div className="flex items-center gap-2 text-yellow-300 font-alchemy text-[10px] animate-bounce font-bold tracking-widest"><Award className="w-3 h-3" /> ESTADO DE GÁS NOBRE</div>}
          {isIsotopoInstavel && <div className="flex items-center gap-2 text-red-500 font-alchemy text-[10px] animate-pulse font-bold tracking-widest"><ShieldAlert className="w-3 h-3" /> ISÓTOPO INSTÁVEL</div>}
          {rollMode === 'damage' && !isRolling && currentSum !== null && <div className={`flex items-center gap-2 font-alchemy text-[10px] font-bold tracking-widest ${currentSum >= 5 ? 'text-red-500' : 'text-amber-200'}`}><Sword className="w-3 h-3" /> IMPACTO NÍVEL {currentSum}</div>}
        </div>

        <div className="relative group scale-[0.7] md:scale-85 transition-transform">
          <div className={`absolute -inset-16 rounded-full blur-[80px] transition-all duration-1000 ${isGasNobre ? 'bg-yellow-400/20' : isIsotopoInstavel ? 'bg-red-600/20' : rollMode === 'inhibitor' ? 'bg-purple-600/10' : 'bg-amber-400/10'}`}></div>
          <div className="relative flex gap-3 md:gap-6 items-center flex-wrap justify-center">
            {diceValues.map((val, idx) => {
              const isDiscarded = discardedIndex === idx;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && idx < 2 && rollMode !== 'damage' && <div className="text-amber-400/30 font-alchemy text-lg">Σ</div>}
                  {idx === 2 && rollMode !== 'damage' && <div className="text-amber-400/20 font-alchemy text-md">/</div>}
                  <div className={`transition-all duration-500 ${isDiscarded ? 'opacity-20 grayscale scale-75 blur-[1px]' : 'opacity-100'}`}>
                    <Dice value={val} isRolling={isRolling} />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback e Controles */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2.5 shrink-0">
        <div className="w-full h-16 md:h-20 flex items-center justify-center text-center px-6 bg-black/60 rounded-2xl border border-amber-500/20 backdrop-blur-xl shadow-xl overflow-hidden">
          {isLoadingCommentary ? (
            <div className="flex gap-3 items-center text-amber-400/70 animate-pulse font-alchemy italic text-[9px] tracking-wide">
              <Sparkles className="w-3 h-3" />
              <span>O Mestre decifra a essência...</span>
            </div>
          ) : commentary ? (
            <div className={`text-[10px] md:text-xs italic leading-tight font-alchemy px-2 ${getSentimentColor(commentary.sentiment)}`}>
              "{commentary.text}"
            </div>
          ) : !isRolling && (
            <div className="text-amber-200/40 flex flex-col items-center gap-1 font-alchemy uppercase tracking-[0.2em] text-[8px]">
               <Wand2 className="w-3 h-3" />
               <span>Aguardando Reação</span>
            </div>
          )}
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling}
          className={`
            w-full py-4 rounded-xl text-md font-alchemy font-black transition-all duration-300
            shadow-xl flex flex-col items-center justify-center border-t border-white/10
            active:scale-95 touch-manipulation
            ${isRolling 
              ? 'bg-[#3d2519] text-amber-800' 
              : rollMode === 'catalyst' 
                ? 'bg-gradient-to-b from-yellow-500 to-amber-700 text-yellow-950'
                : rollMode === 'inhibitor'
                  ? 'bg-gradient-to-b from-purple-800 to-[#1a0f2a] text-purple-100'
                  : rollMode === 'damage'
                    ? 'bg-gradient-to-b from-red-700 to-red-950 text-red-50'
                    : 'bg-gradient-to-b from-amber-600 to-amber-900 text-amber-50'}
          `}
        >
          {isRolling ? <RotateCcw className="animate-spin w-5 h-5" /> : (
            <>
              <span className="flex items-center gap-2 tracking-tight uppercase">
                <Flame className="w-4 h-4" /> {rollMode === 'damage' ? 'Rolar Dano' : 'Teste de Reação'}
              </span>
              <span className="text-[7px] opacity-60 tracking-[0.3em] font-bold uppercase mt-0.5">
                {rollMode === 'damage' ? 'Capítulo 7: Combate' : 'Propriedade da Ordem'}
              </span>
            </>
          )}
        </button>

        {/* Registros Compactos */}
        {history.length > 0 && (
          <div className="w-full">
            <div className="flex items-center gap-2 text-amber-200/30 text-[8px] font-alchemy font-black mb-1 uppercase tracking-widest border-b border-amber-500/10 pb-0.5">
              <History className="w-2.5 h-2.5" /> Últimas Transmutações
            </div>
            <div className="flex gap-1.5 justify-center py-1 overflow-x-auto">
              {history.slice(0, 8).map((roll, idx) => {
                const total = roll.dice2 === 0 ? roll.dice1 : roll.dice1 + roll.dice2;
                const isNobre = total === 12 && roll.dice2 !== 0;
                const isInstavel = total === 2 && roll.dice2 !== 0;
                return (
                  <div key={idx} className={`relative min-w-[32px] w-8 py-1 rounded-md text-center border text-[10px] font-black bg-black/40 ${isNobre ? 'border-yellow-500 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]' : isInstavel ? 'border-red-900 text-red-500' : 'border-amber-500/10 text-amber-200/40'}`}>
                    {total}
                    {isNobre && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-sm"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé Fixo na Base */}
      <div className="w-full flex flex-col items-center gap-0.5 mt-auto pt-2 shrink-0 opacity-30">
        <div className="text-amber-200/40 text-[7px] uppercase tracking-[0.25em] font-alchemy font-bold">
          Alchemia • Volume 1: Fundamentos de Quimera
        </div>
        <div className="text-amber-200/20 text-[6px] uppercase tracking-[0.1em]">
          Copyright © 2026 • Denise Barros de Almeida
        </div>
      </div>
    </div>
  );
};

export default App;
