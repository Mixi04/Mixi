import React, { useState } from 'react';
import { GameProps } from '../../types';
import { Coins, Trophy, Lock, Moon } from 'lucide-react';

const CoinFlip: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [choice, setChoice] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const handleFlip = () => {
    if (!isLoggedIn) {
        onOpenLogin();
        return;
    }
    if (betAmount > balance || betAmount <= 0 || isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    setWinAmount(null);
    updateBalance(-betAmount);
    onPlay(betAmount);

    const outcome = Math.random() > 0.5 ? 'HEADS' : 'TAILS';

    setTimeout(() => {
      setResult(outcome);
      setIsFlipping(false);
      if (outcome === choice) {
        // 1.95x Payout (2.5% House Edge)
        const win = Math.floor(betAmount * 1.95);
        updateBalance(win);
        setWinAmount(win);
      }
    }, 2000);
  };

  return (
    <div className="w-full animate-fade-in">
       <div className="mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                COINFLIP <span className="text-[#F59E0B] text-sm font-bold not-italic px-3 py-1 bg-[#F59E0B]/20 rounded-lg border border-[#F59E0B]/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">1.95x</span>
            </h2>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 bg-[#0F1219] border-4 rounded-[36px] p-12 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[400px] transition-all duration-500
            ${winAmount ? 'border-yellow-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : 
              isFlipping ? 'border-yellow-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 
              'border-[#1E1B2E] shadow-[0_0_25px_rgba(255,255,255,0.02)]'
        }`}>
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none"></div>

            <div className="perspective-1000 mb-12 relative z-10">
                <div 
                    className={`relative w-48 h-48 transform-style-3d transition-transform duration-[2000ms] ease-out ${
                        isFlipping ? 'animate-[spin_0.5s_linear_infinite]' : result === 'HEADS' ? 'rotate-y-0' : result === 'TAILS' ? 'rotate-y-180' : ''
                    }`}
                    style={{ transform: isFlipping ? 'rotateY(1800deg) rotateX(720deg)' : undefined }}
                >
                    <div className="absolute w-full h-full backface-hidden rounded-full border-4 border-[#F59E0B] shadow-[0_0_50px_rgba(245,158,11,0.3)] bg-[#F59E0B] flex items-center justify-center">
                        <Coins className="w-24 h-24 text-white opacity-80" />
                    </div>
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-full border-4 border-gray-600 shadow-[0_0_50px_rgba(75,85,99,0.3)] bg-gray-700 flex items-center justify-center">
                         <div className="w-20 h-20 bg-gray-600 rounded-full" /> 
                    </div>
                </div>
            </div>
            
            <div className="h-8 text-center flex items-center justify-center gap-2 relative z-10">
                {winAmount && (
                    <div className="flex items-center gap-2 text-[#F59E0B] font-black text-2xl animate-scale-in drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                         WON <Moon size={24} fill="currentColor"/> {winAmount.toLocaleString()}
                    </div>
                )}
                {!winAmount && result && result !== choice && <div className="text-gray-500 font-bold">Try again.</div>}
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setChoice('HEADS')} disabled={isFlipping || !isLoggedIn}
                        className={`p-4 rounded-xl border font-black transition-all ${choice === 'HEADS' ? 'border-[#F59E0B] bg-[#F59E0B]/20 text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-[#2A3441] bg-[#0B0E14] text-gray-500 hover:text-gray-300'}`}
                    >HEADS</button>
                    <button onClick={() => setChoice('TAILS')} disabled={isFlipping || !isLoggedIn}
                        className={`p-4 rounded-xl border font-black transition-all ${choice === 'TAILS' ? 'border-gray-500 bg-gray-500/20 text-gray-300 shadow-[0_0_20px_rgba(107,114,128,0.2)]' : 'border-[#2A3441] bg-[#0B0E14] text-gray-500 hover:text-gray-300'}`}
                    >TAILS</button>
                 </div>
            </div>

            <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Bet Amount</label>
                <div className="bg-[#0B0E14] rounded-xl border border-[#2A3441] p-3 flex items-center mb-4 focus-within:border-[#F59E0B] transition-colors">
                    <Moon size={16} className="text-[#F59E0B] mr-2" fill="currentColor" />
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isFlipping || !isLoggedIn}
                        className="bg-transparent w-full outline-none text-white font-mono font-bold text-lg"
                    />
                </div>
                
                {isLoggedIn ? (
                    <button
                        onClick={handleFlip}
                        disabled={isFlipping || betAmount > balance || betAmount <= 0}
                        className="w-full py-4 rounded-xl font-black text-xl bg-[#F59E0B] text-black hover:bg-[#D97706] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                    >
                        {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
                    </button>
                ) : (
                    <button
                        onClick={onOpenLogin}
                        className="w-full py-4 rounded-xl font-black text-sm bg-[#1E293B] border border-[#2A3441] text-gray-400 hover:border-[#F59E0B] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Lock size={16} /> LOG IN TO PLAY
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlip;