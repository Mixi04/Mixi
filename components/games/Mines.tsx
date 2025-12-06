
import React, { useState, useMemo } from 'react';
import { GameProps } from '../../types';
import { Bomb, Diamond, RotateCcw, Moon, Play, Shield, Zap, Sparkles } from 'lucide-react';

const GRID_SIZE = 25;
const HOUSE_EDGE = 0.025; // 2.5% House Edge

// Custom multipliers for 1 Mine specifically
const ONE_MINE_MULTIPLIERS = [
  0.91, 0.95, 0.99, 1.04, 1.10, 
  1.15, 1.22, 1.29, 1.37, 1.46, 
  1.57, 1.69, 1.83, 1.99, 2.19, 
  2.44, 2.74, 3.14, 3.66, 4.39, 
  5.49, 7.33, 10.99
];

const Mines: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
  const [mines, setMines] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);

  // --- Strict Math Implementation ---
  
  const getProbability = (mines: number, picks: number) => {
      let probability = 1;
      const totalTiles = 25;
      const safeTiles = 25 - mines;
      
      for (let i = 0; i < picks; i++) {
          probability *= (safeTiles - i) / (totalTiles - i);
      }
      return probability;
  };

  const multiplierTable = useMemo(() => {
      if (mineCount === 1) {
          const customTable = [...ONE_MINE_MULTIPLIERS];
          const prob24 = getProbability(1, 24);
          const fair24 = 1 / prob24; 
          const real24 = Math.floor(fair24 * (1 - HOUSE_EDGE) * 100) / 100;
          customTable.push(real24);
          return customTable;
      }

      const table = [];
      const safeTiles = 25 - mineCount;
      for (let picks = 1; picks <= safeTiles; picks++) {
          let realMult;
          if (mineCount === 2 && picks === 1) {
              realMult = 0.98;
          } else if (mineCount === 3 && picks === 1) {
              realMult = 1.00;
          } else {
              const prob = getProbability(mineCount, picks);
              const fairMult = 1 / prob;
              realMult = fairMult * (1 - HOUSE_EDGE); 
          }
          table.push(Math.floor(realMult * 100) / 100); 
      }
      return table;
  }, [mineCount]);

  const revealedCount = revealed.filter(Boolean).length;
  
  const getCurrentMult = () => {
      if (revealedCount === 0) return 1.00;
      const idx = revealedCount - 1;
      return idx < multiplierTable.length ? multiplierTable[idx] : multiplierTable[multiplierTable.length - 1];
  };

  const getNextMult = () => {
      const idx = revealedCount;
      return idx < multiplierTable.length ? multiplierTable[idx] : null;
  };

  const activeMultiplier = getCurrentMult();
  const nextMultiplier = getNextMult();
  
  const currentWinAmount = Math.floor(betAmount * activeMultiplier);
  const nextWinAmount = nextMultiplier ? Math.floor(betAmount * nextMultiplier) : 0;

  const startGame = () => {
    if (!isLoggedIn) {
        onOpenLogin();
        return;
    }
    if (betAmount > balance || betAmount <= 0) return;

    const newMines = Array(GRID_SIZE).fill(false);
    let planted = 0;
    while (planted < mineCount) {
        const idx = Math.floor(Math.random() * GRID_SIZE);
        if (!newMines[idx]) { newMines[idx] = true; planted++; }
    }
    
    setMines(newMines);
    setRevealed(Array(GRID_SIZE).fill(false));
    setIsPlaying(true);
    setGameOver(false);
    setWin(false);
    setCurrentMultiplier(1.00);
    updateBalance(-betAmount);
    onPlay(betAmount);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || gameOver || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (mines[index]) {
        setGameOver(true);
        setWin(false);
        setIsPlaying(false);
        setRevealed(Array(GRID_SIZE).fill(true));
    } else {
        const newCount = newRevealed.filter(Boolean).length;
        const newMult = multiplierTable[newCount - 1] || multiplierTable[multiplierTable.length - 1];
        setCurrentMultiplier(newMult);
        
        if (newCount === GRID_SIZE - mineCount) {
            cashOut(newMult);
        }
    }
  };

  const cashOut = (finalMult = activeMultiplier) => {
    if (!isPlaying && !win) return;
    
    if (revealedCount === 0) {
        updateBalance(betAmount);
    } else {
        const winAmt = Math.floor(betAmount * finalMult);
        updateBalance(winAmt);
    }
    
    setGameOver(true);
    setWin(true);
    setIsPlaying(false);
    setRevealed(Array(GRID_SIZE).fill(true));
  };

  const PRESET_MINES = [1, 3, 5, 10, 24];

  return (
    <div className="w-full animate-fade-in max-w-7xl mx-auto">
       <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3 drop-shadow-md">
                MINES <span className="text-emerald-400 text-sm font-bold not-italic px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">97.5% RTP</span>
            </h2>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Controls Sidebar */}
            <div className="lg:col-span-4 order-2 lg:order-1 space-y-4">
                
                {/* Bet Control */}
                <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-[#3F4756] transition-colors">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block flex justify-between">
                        Bet Amount
                        <span className="text-white font-mono">{betAmount.toLocaleString()} M</span>
                    </label>
                    <div className="bg-[#0B0E14] border border-[#2A3441] rounded-xl p-1 flex items-center mb-3 focus-within:border-emerald-500 transition-colors shadow-inner">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#1E293B] rounded-lg ml-1 text-gray-400">
                            <Moon size={16} fill="currentColor" />
                        </div>
                        <input 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            disabled={isPlaying} 
                            className="bg-transparent w-full outline-none font-mono font-bold text-white text-lg px-3 placeholder-gray-700"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['Min', '1/2', '2x', 'Max'].map(label => (
                            <button 
                                key={label}
                                onClick={() => {
                                    if (label === 'Min') setBetAmount(100);
                                    if (label === '1/2') setBetAmount(Math.floor(betAmount / 2));
                                    if (label === '2x') setBetAmount(betAmount * 2);
                                    if (label === 'Max') setBetAmount(balance);
                                }}
                                disabled={isPlaying} 
                                className="bg-[#1E293B] hover:bg-[#2A3441] py-2.5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white uppercase transition-colors border border-transparent hover:border-white/5 active:scale-95"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mine Control */}
                <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-5 shadow-xl">
                     <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mines</label>
                        <span className="text-sm font-bold text-white bg-[#0B0E14] px-3 py-1 rounded-lg border border-white/5">{mineCount}</span>
                     </div>
                     
                     <div className="grid grid-cols-5 gap-2 mb-4">
                        {PRESET_MINES.map(count => (
                            <button
                                key={count}
                                onClick={() => setMineCount(count)}
                                disabled={isPlaying}
                                className={`py-2 rounded-xl text-[11px] font-black transition-all border active:scale-95 ${
                                    mineCount === count 
                                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                        : 'bg-[#1E293B] text-gray-400 border-transparent hover:text-white hover:bg-[#2A3441]'
                                }`}
                            >
                                {count}
                            </button>
                        ))}
                     </div>

                     <input 
                        type="range" 
                        min="1" 
                        max="24" 
                        value={mineCount} 
                        onChange={(e) => setMineCount(parseInt(e.target.value))}
                        disabled={isPlaying}
                        className="w-full h-2 bg-[#0B0E14] rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-[#2A3441]"
                     />
                </div>

                {/* Action Button */}
                 {isPlaying ? (
                     <div className="space-y-3">
                        <button 
                            onClick={() => cashOut()} 
                            disabled={gameOver || revealedCount === 0}
                            className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex flex-col items-center justify-center leading-tight group relative overflow-hidden border shadow-xl
                             ${gameOver || revealedCount === 0 
                                ? 'bg-[#1E293B] border-[#2A3441] text-gray-500 cursor-not-allowed' 
                                : 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 hover:-translate-y-1 shadow-emerald-500/20 border-emerald-400'
                             }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Cashout</span>
                            <span className="flex items-center gap-2 text-2xl group-hover:scale-105 transition-transform">
                                <Moon size={24} fill="currentColor"/> 
                                {revealedCount === 0 ? betAmount.toLocaleString() : currentWinAmount.toLocaleString()}
                            </span>
                        </button>
                        
                        {/* Multiplier Info */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-[#151B25] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                                 <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current</div>
                                 <div className="text-white font-mono font-bold text-lg">{activeMultiplier.toFixed(2)}x</div>
                             </div>
                             <div className="bg-[#151B25] rounded-2xl p-3 border border-emerald-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                                 <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1 relative z-10">Next Tile</div>
                                 <div className="text-emerald-400 font-mono font-bold text-lg relative z-10 flex items-center gap-1">
                                     <Zap size={14} fill="currentColor" />
                                     {nextMultiplier ? `${nextMultiplier.toFixed(2)}x` : 'MAX'}
                                 </div>
                             </div>
                        </div>
                     </div>
                 ) : (
                    isLoggedIn ? (
                        <button 
                            onClick={startGame} 
                            disabled={betAmount > balance || betAmount <= 0}
                            className="w-full py-6 rounded-2xl font-black text-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed border-b-4 border-indigo-800 hover:border-indigo-700 active:border-b-0 active:translate-y-1 active:mt-1"
                        >
                            <Play size={24} fill="currentColor" />
                            START GAME
                        </button>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            className="w-full py-6 rounded-2xl font-black text-sm bg-[#1E293B] border border-[#2A3441] text-gray-400 hover:border-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Shield size={16} /> LOG IN TO PLAY
                        </button>
                    )
                 )}
            </div>

            {/* Game Grid Container */}
            <div className="lg:col-span-8 order-1 lg:order-2">
                <div className={`bg-[#0F1219] rounded-[32px] p-1 border border-[#2A3441] shadow-2xl relative transition-all duration-500
                    ${gameOver && !win ? 'shadow-red-900/10 border-red-900/30' : 
                      win ? 'shadow-emerald-900/10 border-emerald-900/30' : 
                      isPlaying ? 'shadow-indigo-900/10 border-indigo-500/30' : ''}
                `}>
                    <div className="bg-[#0B0E14] rounded-[28px] p-6 lg:p-12 min-h-[550px] flex flex-col items-center justify-center relative overflow-hidden">
                        
                        {/* Background Ambiance */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none opacity-20
                             ${win ? 'bg-[radial-gradient(circle_at_center,_#10B981_0%,_transparent_70%)]' : 
                               gameOver ? 'bg-[radial-gradient(circle_at_center,_#EF4444_0%,_transparent_70%)]' : 
                               'bg-[radial-gradient(circle_at_center,_#4F46E5_0%,_transparent_70%)]'}`} 
                        />

                        {/* HUD Pill */}
                        <div className="absolute top-6 z-20 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex items-center gap-6 shadow-lg">
                             <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                 {mineCount} Mines
                             </div>
                             <div className="w-px h-3 bg-white/10"></div>
                             <div className="flex items-center gap-2 text-sm font-bold text-white">
                                 <Diamond size={14} className="text-emerald-400" />
                                 {GRID_SIZE - mineCount - revealedCount} Gems Left
                             </div>
                        </div>

                        {/* Main Grid */}
                        <div className="relative z-10 grid grid-cols-5 gap-3 sm:gap-4 w-full max-w-[480px] aspect-square">
                            {Array.from({ length: GRID_SIZE }).map((_, idx) => {
                                const isRevealed = revealed[idx];
                                const isMine = mines[idx];
                                
                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleTileClick(idx)} 
                                        disabled={!isPlaying || isRevealed || gameOver}
                                        className={`
                                            relative rounded-xl sm:rounded-2xl transition-all duration-200 group
                                            flex items-center justify-center overflow-hidden
                                            ${!isRevealed 
                                                ? `bg-[#1E293B] border-b-4 border-[#0F172A] hover:bg-[#2A3441] hover:-translate-y-0.5 active:border-b-0 active:translate-y-1 ${!isPlaying ? 'cursor-default opacity-80' : 'cursor-pointer'}` 
                                                : isMine 
                                                    ? 'bg-[#450A0A] border border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]' 
                                                    : 'bg-[#064E3B] border border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
                                            }
                                        `}
                                    >
                                        {/* Pop Animation Wrapper */}
                                        <div className={`transition-all duration-300 ${isRevealed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                                            {isRevealed && (
                                                isMine ? (
                                                    <Bomb size={32} className="text-red-500 drop-shadow-lg animate-pulse" />
                                                ) : (
                                                    <Diamond size={32} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" fill="currentColor" />
                                                )
                                            )}
                                        </div>

                                        {/* Hover Glow for Hidden Tiles */}
                                        {!isRevealed && isPlaying && (
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                                        )}

                                        {/* Post-Game Reveal (Dimmed) */}
                                        {gameOver && !isRevealed && isMine && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 rounded-xl animate-fade-in">
                                                <Bomb size={20} className="text-red-500/50" />
                                            </div>
                                        )}
                                         {gameOver && !isRevealed && !isMine && (
                                            <div className="absolute inset-0 bg-black/40 rounded-xl transition-all"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Floating Result Overlay (Absolute Center) */}
                        {gameOver && (
                             <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                                <div className={`bg-black/60 backdrop-blur-md px-10 py-6 rounded-3xl border shadow-2xl flex flex-col items-center animate-scale-in pointer-events-auto
                                    ${win ? 'border-emerald-500/30 shadow-emerald-500/20' : 'border-red-500/30 shadow-red-500/20'}`}>
                                    
                                    <div className="mb-2">
                                        {win ? <Sparkles size={40} className="text-emerald-400 animate-spin-slow" /> : <Bomb size={40} className="text-red-500" />}
                                    </div>
                                    
                                    <div className={`text-4xl font-black uppercase italic tracking-tighter mb-1 ${win ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {win ? 'CASHOUT!' : 'BUSTED'}
                                    </div>
                                    
                                    {win && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-lg mb-4">
                                            <span className="text-emerald-400 font-mono font-bold text-xl">+{currentWinAmount.toLocaleString()} M</span>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => setGameOver(false)}
                                        className="mt-2 bg-white text-black hover:bg-gray-200 font-bold px-6 py-2.5 rounded-xl uppercase text-sm tracking-wide transition-colors shadow-lg"
                                    >
                                        {win ? 'Play Again' : 'Try Again'}
                                    </button>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default Mines;
