
import React from 'react';

interface DiceProps {
  value: number;
  isRolling: boolean;
}

const DiceFace: React.FC<{ value: number }> = ({ value }) => {
  const dotColor = "bg-amber-900"; // Cor de bronze/madeira escura para os pontos

  const renderDots = () => {
    // Para o valor 1, usamos um selo vermelho especial (Alquimia)
    if (value === 1) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 bg-red-800 rounded-full shadow-inner border border-red-950 flex items-center justify-center">
             <div className="w-1 h-3 bg-red-600 rounded-full transform rotate-45 absolute"></div>
             <div className="w-1 h-3 bg-red-600 rounded-full transform -rotate-45 absolute"></div>
          </div>
        </div>
      );
    }

    if (value === 4 || value === 6) {
      return (
        <div className="flex flex-col justify-between h-full w-full">
           <div className="flex justify-between w-full">
             <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
             <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
           </div>
           {value === 6 && (
             <div className="flex justify-between w-full">
               <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
               <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
             </div>
           )}
           <div className="flex justify-between w-full">
             <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
             <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
           </div>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full flex flex-col justify-between">
        {value === 2 && (
          <>
            <div className="flex justify-start"><div className={`w-3 h-3 ${dotColor} rounded-full`}></div></div>
            <div className="flex justify-end"><div className={`w-3 h-3 ${dotColor} rounded-full`}></div></div>
          </>
        )}
        {value === 3 && (
          <>
            <div className="flex justify-start"><div className={`w-3 h-3 ${dotColor} rounded-full`}></div></div>
            <div className="flex justify-center"><div className={`w-3 h-3 ${dotColor} rounded-full`}></div></div>
            <div className="flex justify-end"><div className={`w-3 h-3 ${dotColor} rounded-full`}></div></div>
          </>
        )}
        {value === 5 && (
          <>
            <div className="flex justify-between">
              <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
              <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
            </div>
            <div className="flex justify-center">
              <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
            </div>
            <div className="flex justify-between">
              <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
              <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-20 h-20 md:w-28 md:h-28 bg-[#fdf5e6] rounded-xl shadow-2xl p-4 border-b-4 border-amber-200/50 flex items-center justify-center relative overflow-hidden">
      {/* Textura de pergaminho/marfim */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")'}}></div>
      {renderDots()}
    </div>
  );
};

export const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
  return (
    <div className={`transition-all duration-300 ${isRolling ? 'animate-dice-roll scale-110 rotate-12' : 'scale-100 rotate-0'}`}>
      <DiceFace value={value} />
    </div>
  );
};
