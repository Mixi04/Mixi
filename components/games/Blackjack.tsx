import React, { useState, useEffect } from 'react';
import { GameProps } from '../../types';
import { Lock, Moon, Layers } from 'lucide-react';

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  key: string; // Unique key for React rendering to prevent re-mounts
}

const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const Blackjack: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'DEALING' | 'PLAYING' | 'DEALER_TURN' | 'ENDED'>('IDLE');
  const [outcome, setOutcome] = useState<'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | null>(null);
  const [winAmount, setWinAmount] = useState<number>(0);

  // --- Game Logic ---

  const createDeck = () => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        let value = parseInt(rank);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        newDeck.push({ suit, rank, value, key: `${suit}-${rank}-${Math.random()}` });
      }
    }
    // Fisher-Yates Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const calculateScore = (hand: Card[]) => {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
      score += card.value;
      if (card.rank === 'A') aces += 1;
    });
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const drawCard = (currentDeck: Card[]) => {
      const card = currentDeck.pop();
      if (!card) throw new Error("Deck empty");
      return { card, newDeck: currentDeck };
  };

  const startGame = async () => {
    if (!isLoggedIn) {
        onOpenLogin();
        return;
    }
    if (betAmount <= 0 || betAmount > balance) return;

    updateBalance(-betAmount);
    onPlay(betAmount);

    let currentDeck = createDeck();
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('DEALING'); // Lock controls
    setOutcome(null);
    setWinAmount(0);

    // Sequential Dealing Animation
    // 1. Player Card 1
    await new Promise(r => setTimeout(r, 400));
    const p1 = drawCard(currentDeck);
    setPlayerHand([p1.card]);
    setDeck(p1.newDeck);

    // 2. Dealer Card 1
    await new Promise(r => setTimeout(r, 800));
    const d1 = drawCard(p1.newDeck);
    setDealerHand([d1.card]);
    setDeck(d1.newDeck);

    // 3. Player Card 2
    await new Promise(r => setTimeout(r, 800));
    const p2 = drawCard(d1.newDeck);
    const finalPlayerHand = [p1.card, p2.card];
    setPlayerHand(finalPlayerHand);
    setDeck(p2.newDeck);

    // 4. Dealer Card 2 (Hidden visually, but in state)
    await new Promise(r => setTimeout(r, 800));
    const d2 = drawCard(p2.newDeck);
    const finalDealerHand = [d1.card, d2.card];
    setDealerHand(finalDealerHand);
    setDeck(d2.newDeck);

    // Check for Instant Blackjack
    const pScore = calculateScore(finalPlayerHand);
    if (pScore === 21) {
        setGameState('ENDED'); // Skip playing phase
        setTimeout(() => handleGameOver(finalPlayerHand, finalDealerHand, 'BLACKJACK'), 500);
    } else {
        setGameState('PLAYING'); // Unlock controls
    }
  };

  const hit = async () => {
    if (gameState !== 'PLAYING') return;
    
    // Slight delay to simulate travel
    setGameState('DEALING'); 
    await new Promise(r => setTimeout(r, 600));

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    
    setDeck(newDeck);
    setPlayerHand(newHand);

    if (calculateScore(newHand) > 21) {
      handleGameOver(newHand, dealerHand, 'BUST');
    } else {
      setGameState('PLAYING');
    }
  };

  const stand = () => {
    if (gameState !== 'PLAYING') return;
    setGameState('DEALER_TURN');
  };

  const doubleDown = async () => {
    if (gameState !== 'PLAYING' || playerHand.length !== 2) return;
    if (balance < betAmount) return;

    updateBalance(-betAmount);
    onPlay(betAmount);

    setGameState('DEALING');
    await new Promise(r => setTimeout(r, 600));

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    if (calculateScore(newHand) > 21) {
        handleGameOver(newHand, dealerHand, 'BUST', betAmount * 2);
    } else {
        setGameState('DEALER_TURN');
    }
  };

  // Dealer AI
  useEffect(() => {
    if (gameState === 'DEALER_TURN') {
        const playDealer = async () => {
            let currentDeck = [...deck];
            let currentHand = [...dealerHand];
            let score = calculateScore(currentHand);

            // Dealer hits on 16 or less
            while (score < 17) {
                await new Promise(resolve => setTimeout(resolve, 1200)); // Slow dealer reveals
                const card = currentDeck.pop()!;
                currentHand = [...currentHand, card];
                score = calculateScore(currentHand);
                setDealerHand([...currentHand]);
                setDeck([...currentDeck]);
            }

            // Delay before result
            await new Promise(resolve => setTimeout(resolve, 800));
            handleGameOver(playerHand, currentHand, 'COMPARE'); 
        };
        playDealer();
    }
  }, [gameState]);

  const handleGameOver = (pHand: Card[], dHand: Card[], reason: string, finalBet = betAmount) => {
      const pScore = calculateScore(pHand);
      const dScore = calculateScore(dHand);
      
      let multiplier = 0;
      let result: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' = 'LOSE';
      
      if (reason === 'BLACKJACK') {
          result = 'BLACKJACK';
          multiplier = 2.5; 
      } else if (reason === 'BUST') {
          result = 'LOSE';
          multiplier = 0;
      } else if (dScore > 21) {
          result = 'WIN';
          multiplier = 2;
      } else if (pScore > dScore) {
          result = 'WIN';
          multiplier = 2;
      } else if (pScore < dScore) {
          result = 'LOSE';
          multiplier = 0;
      } else {
          result = 'PUSH';
          multiplier = 1;
      }

      setOutcome(result);
      setGameState('ENDED');

      if (multiplier > 0) {
          const payout = Math.floor(finalBet * multiplier); 
          setWinAmount(payout);
          updateBalance(payout);
      }
  };


  // --- Render Helpers ---

  const renderCard = (card: Card, index: number, isHidden = false) => {
    if (isHidden) {
         return (
            <div key={`hidden-${index}`} className="w-20 h-28 md:w-24 md:h-36 bg-[#1A1D29] border border-indigo-500/50 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center relative -ml-12 first:ml-0 z-0">
                <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Moon className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" size={32} />
                </div>
            </div>
         );
    }

    const isRed = card.suit === 'Hearts' || card.suit === 'Diamonds';
    const SuitIcon = () => {
        if (card.suit === 'Hearts') return <span className="text-red-500 drop-shadow-md">♥</span>;
        if (card.suit === 'Diamonds') return <span className="text-red-500 drop-shadow-md">♦</span>;
        if (card.suit === 'Clubs') return <span className="text-slate-800 drop-shadow-md">♣</span>;
        return <span className="text-slate-800 drop-shadow-md">♠</span>;
    };

    return (
      <div 
        key={card.key} 
        className="w-20 h-28 md:w-24 md:h-36 bg-white rounded-lg shadow-[0_0_25px_rgba(255,255,255,0.15)] flex flex-col items-center justify-between p-2 relative -ml-12 first:ml-0 transition-all duration-500 group border border-gray-100/50 animate-slide-in-blur"
        style={{ zIndex: index }}
      >
        <style>{`
          @keyframes slideInBlur {
            0% { 
              opacity: 0; 
              transform: translateY(-50px) scale(1.1);
              filter: blur(8px);
            }
            60% {
              filter: blur(4px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }
          .animate-slide-in-blur {
            animation: slideInBlur 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
        
        {/* Gloss Effect */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white to-transparent rounded-t-lg pointer-events-none opacity-50"></div>

        <div className={`text-base md:text-xl font-black self-start leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {card.rank}
        </div>
        <div className="text-3xl md:text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform group-hover:scale-110 transition-transform duration-500">
            <SuitIcon />
        </div>
        <div className={`text-base md:text-xl font-black self-end rotate-180 leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {card.rank}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-fade-in p-6">
       <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                BLACKJACK <span className="text-indigo-400 text-sm font-bold not-italic px-3 py-1 bg-indigo-500/20 rounded-lg border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]">3:2 PAYOUT</span>
            </h2>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Table */}
        <div className={`lg:col-span-3 bg-[#0F1219] border-4 rounded-[40px] p-8 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] min-h-[550px] flex flex-col justify-between group transition-colors duration-1000
             ${gameState === 'DEALER_TURN' ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 
                  gameState === 'PLAYING' || gameState === 'DEALING' ? 'border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 
                  'border-[#1E1B2E] shadow-[0_0_30px_rgba(255,255,255,0.05)]'}`}>

            {/* Neon Border Glow */}
            <div className={`absolute inset-0 rounded-[36px] border-4 transition-all duration-1000 pointer-events-none z-20
                ${gameState === 'DEALER_TURN' ? 'border-red-500/40 shadow-[inset_0_0_60px_rgba(239,68,68,0.2)]' : 
                  gameState === 'PLAYING' || gameState === 'DEALING' ? 'border-indigo-500/40 shadow-[inset_0_0_60px_rgba(99,102,241,0.2)]' : 
                  'border-[#1E1B2E]'}`}>
            </div>

            {/* Table Felt Texture & Spotlight */}
            <div className="absolute inset-0 bg-[#0F1219] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0F1219] to-[#0F1219]"></div>
                {/* Spotlight effect follows turn */}
                <div className={`absolute left-0 right-0 h-[400px] bg-indigo-500/10 blur-[100px] transition-all duration-1000
                    ${gameState === 'DEALER_TURN' ? 'top-0 bg-red-500/5' : gameState === 'PLAYING' ? 'bottom-0 bg-indigo-500/10' : 'top-1/2 -translate-y-1/2 opacity-0'}`}>
                </div>
            </div>

            {/* Dealer Area */}
            <div className="relative z-10 flex flex-col items-center pt-8">
                <div className={`flex items-center gap-2 mb-6 transition-opacity duration-300 ${gameState === 'PLAYING' || gameState === 'DEALING' ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="bg-black/60 px-5 py-2 rounded-full text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        Dealer
                    </div>
                    <div className="text-white font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {gameState === 'IDLE' || gameState === 'DEALING' ? 0 : 
                         gameState === 'PLAYING' ? calculateScore([dealerHand[0]]) : calculateScore(dealerHand)}
                    </div>
                </div>
                <div className="flex items-center justify-center pl-12 min-h-[160px]">
                    {dealerHand.map((card, i) => renderCard(card, i, i === 1 && (gameState === 'PLAYING' || gameState === 'DEALING')))}
                    {dealerHand.length === 0 && <div className="h-36 w-24 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-white/10 font-black text-sm uppercase">Empty</div>}
                </div>
            </div>

            {/* Center Info (Logo) */}
            <div className="relative z-0 flex items-center justify-center pointer-events-none select-none my-auto">
                 <h1 className="text-8xl font-black italic text-white/5 tracking-tighter transform -rotate-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse-slow">MOONBLOX</h1>
            </div>

            {/* Player Area */}
            <div className="relative z-10 flex flex-col items-center pb-4">
                <div className="flex items-center justify-center pl-12 mb-6 min-h-[160px]">
                     {playerHand.map((card, i) => renderCard(card, i))}
                     {playerHand.length === 0 && <div className="h-36 w-24 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-white/10 font-black text-sm uppercase">Empty</div>}
                </div>
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${gameState === 'DEALER_TURN' ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="bg-indigo-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-indigo-400">
                        You
                    </div>
                    <div className="text-white font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-black/40 px-4 py-1 rounded-lg border border-white/10">
                        {calculateScore(playerHand)}
                    </div>
                </div>
            </div>

            {/* NEW OVERLAY - Explicit Game Result */}
            {gameState === 'ENDED' && outcome && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-scale-in">
                     <div className="bg-black/80 backdrop-blur-xl px-12 py-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2 transform scale-110">
                         <div className={`text-5xl font-black uppercase tracking-tighter italic whitespace-nowrap drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] ${
                             outcome === 'WIN' || outcome === 'BLACKJACK' ? 'text-emerald-500' :
                             outcome === 'LOSE' ? 'text-rose-500' : 'text-gray-300'
                         }`}>
                             {outcome === 'BLACKJACK' ? 'BLACKJACK!' : 
                              outcome === 'WIN' ? 'PLAYER WINS' : 
                              outcome === 'LOSE' ? 'DEALER WINS' : 'PUSH'}
                         </div>
                         {(outcome === 'WIN' || outcome === 'BLACKJACK') && (
                             <div className="text-white font-mono font-bold text-2xl flex items-center gap-2 bg-white/5 px-6 py-2 rounded-xl border border-white/5 mt-2">
                                 <Moon size={24} className="text-yellow-500" fill="currentColor"/>
                                 +{winAmount.toLocaleString()}
                             </div>
                         )}
                     </div>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={12} /> Game Actions
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button 
                        onClick={hit}
                        disabled={gameState !== 'PLAYING'}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#1E293B] disabled:text-gray-600 disabled:shadow-none text-[#020617] font-black py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(4,120,87)] active:shadow-none active:translate-y-[4px] disabled:translate-y-0"
                    >
                        HIT
                    </button>
                    <button 
                        onClick={stand}
                        disabled={gameState !== 'PLAYING'}
                        className="bg-rose-500 hover:bg-rose-400 disabled:bg-[#1E293B] disabled:text-gray-600 disabled:shadow-none text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(190,18,60)] active:shadow-none active:translate-y-[4px] disabled:translate-y-0"
                    >
                        STAND
                    </button>
                </div>
                <button 
                    onClick={doubleDown}
                    disabled={gameState !== 'PLAYING' || playerHand.length !== 2}
                    className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-[#1E293B] disabled:text-gray-600 disabled:shadow-none text-black font-black py-3 rounded-xl transition-all shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-[4px] text-sm uppercase tracking-wide disabled:translate-y-0"
                >
                    Double Down (2x)
                </button>
            </div>

            <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6 shadow-2xl">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Wager Amount</label>
                <div className="bg-[#0B0E14] rounded-xl border border-[#2A3441] p-1 flex items-center mb-4 focus-within:border-indigo-500 transition-colors shadow-inner">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#1E293B] rounded-lg">
                        <Moon size={16} className="text-blox-accent" fill="currentColor" />
                    </div>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={gameState === 'PLAYING' || gameState === 'DEALING' || !isLoggedIn}
                        className="bg-transparent w-full outline-none text-white font-mono font-bold text-lg px-3"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                     <button onClick={() => setBetAmount(betAmount * 2)} disabled={gameState === 'PLAYING' || gameState === 'DEALING'} className="bg-[#1E293B] hover:bg-[#2A3441] py-2 rounded-lg text-[10px] font-black text-gray-400 hover:text-white uppercase transition-colors">2x</button>
                     <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} disabled={gameState === 'PLAYING' || gameState === 'DEALING'} className="bg-[#1E293B] hover:bg-[#2A3441] py-2 rounded-lg text-[10px] font-black text-gray-400 hover:text-white uppercase transition-colors">1/2</button>
                </div>

                {gameState === 'IDLE' || gameState === 'ENDED' ? (
                     isLoggedIn ? (
                        <button
                            onClick={startGame}
                            disabled={betAmount > balance || betAmount <= 0}
                            className="w-full py-4 rounded-xl font-black text-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-indigo-400/50"
                        >
                            DEAL CARDS
                        </button>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            className="w-full py-4 rounded-xl font-black text-sm bg-[#1E293B] border border-[#2A3441] text-gray-400 hover:border-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Lock size={16} /> LOG IN TO PLAY
                        </button>
                    )
                ) : (
                    <button disabled className="w-full py-4 rounded-xl font-black text-lg bg-[#0B0E14] text-gray-600 border border-[#1E293B] cursor-not-allowed flex items-center justify-center gap-2">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></div> 
                         {gameState === 'DEALING' ? 'DEALING...' : 'LIVE ROUND'}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;