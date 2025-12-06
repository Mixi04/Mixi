
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { Moon, Plus, Trash2, Users, Sword, Trophy, ChevronRight, Lock, RotateCcw, X, Bot as BotIcon, Copy, User, CheckCircle } from 'lucide-react';

// --- Shared Data & Types ---

interface Item {
  id: string;
  name: string;
  image: string;
  value: number;
  chance: number;
  color: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
  items: Item[];
  color: string;
}

// Reusing Item Database for consistency
const ITEMS_DB: Record<string, Item> = {
  'bloxy-cola': { id: 'bloxy-cola', name: 'Bloxy Cola', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040144/10472779_gqx37v.webp', value: 50, chance: 0.5, color: '#A855F7', rarity: 'EPIC' },
  'hilarius': { id: 'hilarius', name: 'Hilarius Face', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040220/2786135_fztrxg.webp', value: 15, chance: 0.5, color: '#9CA3AF', rarity: 'COMMON' },
  'snack-bloxy': { id: 'snack-bloxy', name: 'Bloxy Cola', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040144/10472779_gqx37v.webp', value: 50, chance: 0.45, color: '#9CA3AF', rarity: 'COMMON' },
  'snack-cheezburger': { id: 'snack-cheezburger', name: 'Cheezburger', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040114/16726030_kwcqqx.webp', value: 99, chance: 0.35, color: '#9CA3AF', rarity: 'COMMON' },
  'snack-hilarius': { id: 'snack-hilarius', name: 'Hilarius Face', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040220/2786135_fztrxg.webp', value: 15, chance: 0.15, color: '#9CA3AF', rarity: 'COMMON' },
  'snack-taco': { id: 'snack-taco', name: 'Taco', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040196/15177716_fjvald.webp', value: 150, chance: 0.05, color: '#22C55E', rarity: 'UNCOMMON' },
  'hair-shaggy': { id: 'hair-shaggy', name: 'Shaggy', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040302/20573078_wnx0cc.webp', value: 1486, chance: 0.01, color: '#F59E0B', rarity: 'LEGENDARY' },
  'hat-chill': { id: 'hat-chill', name: 'Chill Cap', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040478/9fdd76ff-4614-4bca-80b7-69bf4a95396c.png', value: 643, chance: 0.025, color: '#3B82F6', rarity: 'RARE' },
  'hat-goldrow': { id: 'hat-goldrow', name: 'Goldrow', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040801/dd0f8dd4-3ea3-437d-8c19-9743af0f63ce.png', value: 231, chance: 0.005, color: '#EAB308', rarity: 'RARE' },
  'hat-paper': { id: 'hat-paper', name: 'Paper Hat', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040452/7422f51d-6cd0-43d6-a7d8-1406ec981cca.png', value: 95, chance: 0.09, color: '#22C55E', rarity: 'UNCOMMON' },
  'hair-purple': { id: 'hair-purple', name: 'Purple Hair', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040376/430062818_zfa1pi.webp', value: 65, chance: 0.12, color: '#22C55E', rarity: 'UNCOMMON' },
  'hair-blue': { id: 'hair-blue', name: 'Blue Hair', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040257/846803597_qp8tsg.webp', value: 65, chance: 0.38, color: '#9CA3AF', rarity: 'COMMON' },
  'hair-green': { id: 'hair-green', name: 'Green Hair', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040276/1033117580_raxw09.webp', value: 65, chance: 0.38, color: '#9CA3AF', rarity: 'COMMON' },
  'fedora-rainbow': { id: 'fedora-rainbow', name: 'Rainbow Fedora', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041026/f9b32f1b-92ec-45a6-9389-f9595803392a.png', value: 62666, chance: 0.3, color: '#EAB308', rarity: 'LEGENDARY' },
  'fedora-sparkle': { id: 'fedora-sparkle', name: 'Sparkle Time', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041012/b4f25c92-e55e-48aa-95d1-1166aeeeaa1d.png', value: 1676767, chance: 0.1, color: '#EAB308', rarity: 'LEGENDARY' },
  'fedora-black': { id: 'fedora-black', name: 'Black Sparkle Time', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041068/988463c1-7bfe-40a0-af26-6b88d614063f.png', value: 5777777, chance: 0.05, color: '#EAB308', rarity: 'LEGENDARY' },
  'fedora-sinister': { id: 'fedora-sinister', name: 'Sinister Fedora', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040952/c76bd649-3eae-4f61-ad02-7607f31bd9f9.png', value: 104354, chance: 2, color: '#A855F7', rarity: 'EPIC' },
  'dominus-astra': { id: 'dominus-astra', name: 'Dominus Astra', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040681/a763e4f4-04c9-4aa6-8ab0-ad8d1c605e20.png', value: 14333555, chance: 0.003, color: '#EF4444', rarity: 'LEGENDARY' },
  'dominus-aureus': { id: 'dominus-aureus', name: 'Dominus Aureus', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040859/2915676e-7b55-405a-9463-add1edd88c01.png', value: 5100333, chance: 0.01, color: '#EAB308', rarity: 'LEGENDARY' },
  'hat-8bit-crown': { id: 'hat-8bit-crown', name: '8 Bit Royal Crown', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040622/b9e0cc9b-db1d-4c92-b273-6186f432cc29.png', value: 14676, chance: 1, color: '#A855F7', rarity: 'EPIC' },
  'hat-bucket': { id: 'hat-bucket', name: 'Bucket', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040570/cd5e06e5-0fcc-4d07-8b56-218b10b1d2a4.png', value: 14079, chance: 3, color: '#A855F7', rarity: 'EPIC' },
  'hat-golden-top': { id: 'hat-golden-top', name: 'Golden Top Hat', image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040594/3042fb19-0297-449e-ae16-38a28b51ec65.png', value: 20222, chance: 1, color: '#EAB308', rarity: 'EPIC' }
};

const AVAILABLE_CASES: Case[] = [
  { id: 'starter-snack', name: 'Starter Snack', price: 100, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040114/16726030_kwcqqx.webp', color: '#F59E0B', items: [ITEMS_DB['snack-bloxy'], ITEMS_DB['snack-cheezburger'], ITEMS_DB['snack-hilarius'], ITEMS_DB['snack-taco']] },
  { id: 'hair-surprise', name: 'Hair Surprise', price: 300, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040376/430062818_zfa1pi.webp', color: '#A855F7', items: [ITEMS_DB['hair-shaggy'], ITEMS_DB['hat-chill'], ITEMS_DB['hat-goldrow'], ITEMS_DB['hat-paper'], ITEMS_DB['hair-purple'], ITEMS_DB['hair-blue'], ITEMS_DB['hair-green']] },
  { id: 'bucket-bust', name: 'Bucket or Bust', price: 1400, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040570/cd5e06e5-0fcc-4d07-8b56-218b10b1d2a4.png', color: '#A855F7', items: [ITEMS_DB['hat-bucket'], ITEMS_DB['hat-chill'], ITEMS_DB['hat-goldrow']] },
  { id: 'fedora-frenzy', name: 'Fedora Frenzy', price: 1500, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041012/b4f25c92-e55e-48aa-95d1-1166aeeeaa1d.png', color: '#EAB308', items: [ITEMS_DB['fedora-black'], ITEMS_DB['fedora-sparkle'], ITEMS_DB['fedora-rainbow'], ITEMS_DB['fedora-sinister'], ITEMS_DB['hat-goldrow'], ITEMS_DB['hat-paper']] },
  { id: 'high-stakes', name: 'High Stakes', price: 7500, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040952/c76bd649-3eae-4f61-ad02-7607f31bd9f9.png', color: '#A855F7', items: [ITEMS_DB['fedora-sinister'], ITEMS_DB['hat-bucket'], ITEMS_DB['hat-chill']] },
  { id: 'dominus-dream', name: 'Dominus Dream', price: 25000, image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040681/a763e4f4-04c9-4aa6-8ab0-ad8d1c605e20.png', color: '#EF4444', items: [ITEMS_DB['dominus-astra'], ITEMS_DB['dominus-aureus'], ITEMS_DB['fedora-black'], ITEMS_DB['fedora-sparkle'], ITEMS_DB['fedora-sinister'], ITEMS_DB['hat-8bit-crown'], ITEMS_DB['hat-bucket'], ITEMS_DB['hat-chill'], ITEMS_DB['hat-goldrow'], ITEMS_DB['snack-taco'], ITEMS_DB['snack-cheezburger'], ITEMS_DB['snack-bloxy']] },
  { id: 'starter', name: 'Starter Case', price: 36, image: 'https://cdn.rostake.com/cases/1.webp', color: '#F59E0B', items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']] },
  { id: 'blue-steel', name: 'Blue Steel', price: 150, image: 'https://cdn.rostake.com/cases/1.webp', color: '#3B82F6', items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']] },
  { id: 'radioactive', name: 'Radioactive', price: 500, image: 'https://cdn.rostake.com/cases/1.webp', color: '#22C55E', items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']] },
  { id: 'high-roller', name: 'High Roller', price: 2500, image: 'https://cdn.rostake.com/cases/1.webp', color: '#A855F7', items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']] }
];

const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Mixi', 'Pinky'];

type BattleMode = '1v1' | '1v1v1' | '1v1v1v1' | '2v2' | '3v3';
type BattleState = 'SETUP' | 'LOBBY' | 'PLAYING' | 'FINISHED';

// --- Configuration ---
const TAPE_LENGTH = 40;
const WIN_INDEX = 35;
const SPIN_DURATION = 4000;
// For vertical scrolling, we use Item Height
const ITEM_HEIGHT = 80;
const ITEM_GAP = 8; // tailwind gap-2
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_GAP;

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  team: number; // 1 or 2
  totalValue: number;
  
  // Battle State
  history: Item[]; // Won items from previous rounds
  currentTape: Item[]; // The items currently on the spinner
  currentWinItem: Item | null; // The item determined to be the winner of current spin
  currentOffset: number; // CSS translateY value
}

const CaseBattles: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  // Setup State
  const [battleState, setBattleState] = useState<BattleState>('SETUP');
  const [mode, setMode] = useState<BattleMode>('1v1');
  const [selectedCases, setSelectedCases] = useState<Case[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(-1); // -1 = not started, 0 = first case
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningTeam, setWinningTeam] = useState<number | null>(null);
  const [winningsShare, setWinningsShare] = useState<number>(0);

  // Refs for tracking animation state
  const roundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCost = selectedCases.reduce((acc, c) => acc + c.price, 0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  // --- Logic Helpers ---

  const getWeightedOutcome = (items: Item[]) => {
    const totalWeight = items.reduce((sum, item) => sum + item.chance, 0);
    const r = Math.random() * totalWeight;
    let accum = 0;
    for (const item of items) {
      accum += item.chance;
      if (r <= accum) return item;
    }
    return items[items.length - 1]; 
  };

  const generateTape = (caseItems: Item[], winner: Item) => {
    const tape: Item[] = [];
    const poolSize = caseItems.length;
    for (let i = 0; i < TAPE_LENGTH; i++) {
        if (i === WIN_INDEX) {
            tape.push(winner);
        } else {
            tape.push(caseItems[Math.floor(Math.random() * poolSize)]);
        }
    }
    return tape;
  };

  const addCase = (c: Case) => {
    if (selectedCases.length < 50) setSelectedCases([...selectedCases, c]);
  };

  const removeCase = (index: number) => {
    const newCases = [...selectedCases];
    newCases.splice(index, 1);
    setSelectedCases(newCases);
  };

  const resetBattle = () => {
      setBattleState('SETUP');
      setPlayers([]);
      setCurrentRound(-1);
      setWinningTeam(null);
      setWinningsShare(0);
      setIsSpinning(false);
  };

  // --- Core Battle Logic ---

  const createEmptySlot = (team: number): Player => ({
      id: 'empty', name: 'Waiting...', avatar: '', 
      isBot: false, team, totalValue: 0,
      history: [], currentTape: [], currentWinItem: null, currentOffset: 0
  });

  const createLobby = () => {
    if (!isLoggedIn) { onOpenLogin(); return; }
    if (selectedCases.length === 0) return;
    if (balance < totalCost) return;

    // Deduct balance immediately to reserve
    updateBalance(-totalCost);
    onPlay(totalCost); 

    const slots: Player[] = [];
    
    // User always Team 1, Slot 1
    slots.push({
        id: 'user', name: 'You', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=user`,
        isBot: false, team: 1, totalValue: 0, 
        history: [], currentTape: [], currentWinItem: null, currentOffset: 0
    });

    // Define structure based on mode
    if (mode === '1v1') {
        slots.push(createEmptySlot(2));
    } else if (mode === '1v1v1') {
        slots.push(createEmptySlot(2));
        slots.push(createEmptySlot(3));
    } else if (mode === '1v1v1v1') {
        slots.push(createEmptySlot(2));
        slots.push(createEmptySlot(3));
        slots.push(createEmptySlot(4));
    } else if (mode === '2v2') {
        slots.push(createEmptySlot(1)); // Teammate
        slots.push(createEmptySlot(2)); // Enemy 1
        slots.push(createEmptySlot(2)); // Enemy 2
    } else if (mode === '3v3') {
        slots.push(createEmptySlot(1)); // Teammate 1
        slots.push(createEmptySlot(1)); // Teammate 2
        slots.push(createEmptySlot(2)); // Enemy 1
        slots.push(createEmptySlot(2)); // Enemy 2
        slots.push(createEmptySlot(2)); // Enemy 3
    }

    setPlayers(slots);
    setBattleState('LOBBY');
  };

  const callBot = (index: number) => {
      const newPlayers = [...players];
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      newPlayers[index] = {
          ...newPlayers[index],
          id: `bot-${Date.now()}-${index}`,
          name: botName,
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${botName}`,
          isBot: true
      };
      setPlayers(newPlayers);
  };

  const leaveLobby = () => {
      // Refund
      updateBalance(totalCost);
      resetBattle();
  };

  const copyLink = () => {
      // Fake link copy
      const url = window.location.href + '?battle=' + Math.floor(Math.random() * 99999);
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  }

  const startBattle = () => {
    if (players.some(p => p.id === 'empty')) return; // Check again safety

    // Initialize visual tapes for first round
    const firstCase = selectedCases[0];
    const initialPlayers = players.map(p => ({
        ...p,
        currentTape: Array.from({length: 10}).map((_, i) => firstCase.items[i % firstCase.items.length]),
        currentOffset: 0
    }));

    setPlayers(initialPlayers);
    setBattleState('PLAYING');
    setCurrentRound(-1);

    // Start Loop
    runGameLoop(initialPlayers, 0);
  };

  const runGameLoop = (currentPlayers: Player[], roundIndex: number) => {
    // If no more cases, finish
    if (roundIndex >= selectedCases.length) {
        finishBattle(currentPlayers);
        return;
    }

    setCurrentRound(roundIndex);
    const activeCase = selectedCases[roundIndex];

    // 1. Prepare Round (Generate Outcomes & Tapes)
    const nextPlayers = currentPlayers.map(p => {
        const winner = getWeightedOutcome(activeCase.items);
        const tape = generateTape(activeCase.items, winner);
        // Random jitter for offset to make it look organic
        const jitter = Math.floor(Math.random() * 40) - 20; 
        
        // Vertical calculation:
        // WIN_INDEX = 35. Total Item Height = 88.
        // Tape moves UP, so negative offset.
        const targetOffset = -(WIN_INDEX * TOTAL_ITEM_HEIGHT) + jitter;

        return {
            ...p,
            currentTape: tape,
            currentWinItem: winner,
            currentOffset: targetOffset 
        };
    });

    // 2. Set State to Trigger Animation (Initially offset 0 to prep, then animate)
    // We first set the tapes with offset 0 (or previous position reset).
    const resetPlayers = nextPlayers.map(p => ({ ...p, currentOffset: 0 }));
    setPlayers(resetPlayers);

    // Step B: Trigger Spin (after brief delay for DOM update)
    setTimeout(() => {
        setIsSpinning(true);
        setPlayers(nextPlayers); // Applies the target offsets -> CSS transition handles the rest

        // Step C: Wait for Spin End
        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            
            // Step D: Reveal & Update Totals
            const revealedPlayers = nextPlayers.map(p => {
                if (!p.currentWinItem) return p;
                return {
                    ...p,
                    totalValue: p.totalValue + p.currentWinItem.value,
                    history: [p.currentWinItem, ...p.history] // Add to history stack
                };
            });
            setPlayers(revealedPlayers);

            // Step E: Schedule Next Round
            roundTimeoutRef.current = setTimeout(() => {
                runGameLoop(revealedPlayers, roundIndex + 1);
            }, 1500); // 1.5s delay before next case starts

        }, SPIN_DURATION);
    }, 100);
  };

  const finishBattle = (finalPlayers: Player[]) => {
      setBattleState('FINISHED');

      // Determine Winners
      const teamScores: Record<number, number> = {};
      finalPlayers.forEach(p => {
          teamScores[p.team] = (teamScores[p.team] || 0) + p.totalValue;
      });

      let winningTeamId = -1;
      let maxScore = -1;
      // Handle tie? Assuming > maxScore takes it.
      Object.entries(teamScores).forEach(([teamStr, score]) => {
          const tId = parseInt(teamStr);
          if (score > maxScore) {
              maxScore = score;
              winningTeamId = tId;
          } else if (score === maxScore) {
              // Tie breaker
              if (Math.random() > 0.5) winningTeamId = tId;
          }
      });

      setWinningTeam(winningTeamId);

      // Payout Calculation - Winner takes all opened items logic
      // Sum of ALL drops from ALL players
      const totalDropsValue = finalPlayers.reduce((acc, p) => acc + p.totalValue, 0);
      
      const winners = finalPlayers.filter(p => p.team === winningTeamId);
      const winnerCount = winners.length || 1; // Safety
      
      const isUserWinner = winners.some(p => p.id === 'user');

      if (isUserWinner) {
          // Split entire pot of items among winning team members
          const myShare = Math.floor(totalDropsValue / winnerCount);
          setWinningsShare(myShare);
          // Credit after visual delay
          setTimeout(() => updateBalance(myShare), 1000);
      } else {
          setWinningsShare(0);
      }
  };


  // --- Render Components ---

  const renderLobby = () => (
      <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-8 mb-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blox-accent to-transparent"></div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">BATTLE LOBBY</h2>
                <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-400 mb-6">
                    <span className="bg-[#0B0E14] px-3 py-1 rounded-lg border border-[#2A3441] flex items-center gap-2">
                        <Moon size={14} className="text-blox-accent" fill="currentColor"/> {totalCost} Buy-in
                    </span>
                    <span className="bg-[#0B0E14] px-3 py-1 rounded-lg border border-[#2A3441] flex items-center gap-2">
                        <Users size={14} /> {mode}
                    </span>
                    <span className="bg-[#0B0E14] px-3 py-1 rounded-lg border border-[#2A3441] flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500" /> {selectedCases.length} Rounds
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {players.map((p, i) => (
                        <div key={i} className={`bg-[#0B0E14] rounded-2xl p-4 border transition-all relative group
                            ${p.id === 'empty' ? 'border-[#2A3441] border-dashed' : 'border-blox-accent/50'}
                        `}>
                            {p.id === 'empty' ? (
                                <div className="flex flex-col items-center h-full justify-between gap-3">
                                    <div className="w-16 h-16 rounded-full bg-[#151B25] flex items-center justify-center animate-pulse">
                                        <User className="text-gray-600" size={24} />
                                    </div>
                                    <div className="text-gray-500 font-bold text-xs uppercase">Waiting...</div>
                                    <button 
                                        onClick={() => callBot(i)}
                                        className="w-full py-2 bg-[#151B25] hover:bg-blox-accent hover:text-black border border-[#2A3441] text-gray-400 rounded-lg text-xs font-black uppercase transition-colors flex items-center justify-center gap-1"
                                    >
                                        <BotIcon size={12} /> Call Bot
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                     <div className="relative">
                                         <img src={p.avatar} className="w-16 h-16 rounded-full bg-[#151B25]" />
                                         <div className="absolute -bottom-1 -right-1 bg-[#151B25] border border-[#2A3441] p-1 rounded-md">
                                             {p.isBot ? <BotIcon size={10} className="text-gray-400"/> : <User size={10} className="text-blox-accent"/>}
                                         </div>
                                     </div>
                                     <div className="text-white font-bold text-sm truncate w-full text-center">{p.name}</div>
                                     <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${p.team === 1 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                                         Team {p.team}
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <button 
                        onClick={leaveLobby}
                        className="flex-1 py-4 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-xl transition-colors text-sm uppercase flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Cancel Battle
                    </button>
                    <button 
                        onClick={copyLink}
                        className="flex-1 py-4 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-xl transition-colors text-sm uppercase flex items-center justify-center gap-2 border border-white/5"
                    >
                        {copiedLink ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        {copiedLink ? 'Link Copied' : 'Invite Friends'}
                    </button>
                    <button 
                        onClick={startBattle}
                        disabled={players.some(p => p.id === 'empty')}
                        className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase flex items-center justify-center gap-2 transform hover:-translate-y-1 active:translate-y-0"
                    >
                        <Sword size={18} /> Start Battle
                    </button>
                </div>
          </div>
      </div>
  );

  const renderSetup = () => (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-12">
          {/* Left: Case Selector */}
          <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6">
                  <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                      <Plus className="text-blox-accent" /> Add Cases
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {AVAILABLE_CASES.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => addCase(c)}
                            className="bg-[#0B0E14] border border-[#2A3441] hover:border-blox-accent hover:bg-[#1A202C] rounded-xl p-3 flex flex-col items-center transition-all group relative overflow-hidden"
                          >
                              <div className="relative w-20 h-20 mb-2 group-hover:scale-110 transition-transform">
                                  <img src={c.image} className="w-full h-full object-contain drop-shadow-lg" />
                              </div>
                              <div className="text-xs font-bold text-gray-300 truncate w-full text-center">{c.name}</div>
                              <div className="text-blox-accent font-mono font-bold text-xs mt-1">{c.price} M</div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right: Config & Cart */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#151B25] border border-[#2A3441] rounded-3xl p-6">
                   <div className="mb-6">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Battle Mode</label>
                       <div className="grid grid-cols-3 gap-2">
                           {['1v1', '1v1v1', '1v1v1v1', '2v2', '3v3'].map(m => (
                               <button 
                                key={m}
                                onClick={() => setMode(m as BattleMode)}
                                className={`py-3 rounded-xl text-xs font-black uppercase transition-all border flex items-center justify-center gap-2 ${
                                    mode === m ? 'bg-blox-accent text-black border-blox-accent' : 'bg-[#0B0E14] text-gray-400 border-[#2A3441] hover:text-white'
                                }`}
                               >
                                   {m}
                               </button>
                           ))}
                       </div>
                   </div>
                   
                   <div className="mb-6">
                       <div className="flex justify-between items-end mb-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected Cases</label>
                           <button onClick={() => setSelectedCases([])} className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={10}/> Clear</button>
                       </div>
                       <div className="bg-[#0B0E14] rounded-xl border border-[#2A3441] p-2 h-64 overflow-y-auto scrollbar-hide space-y-2 relative">
                           {selectedCases.length === 0 && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 gap-2 pointer-events-none">
                                   <Plus size={24} />
                                   <span className="text-xs font-bold">Add cases to start</span>
                               </div>
                           )}
                           {selectedCases.map((c, i) => (
                               <div key={i} className="flex items-center gap-3 bg-[#151B25] p-2 rounded-lg group animate-scale-in border border-transparent hover:border-white/10">
                                   <img src={c.image} className="w-10 h-10 object-contain" />
                                   <div className="flex-1 min-w-0">
                                       <div className="text-xs font-bold text-gray-300 truncate">{c.name}</div>
                                       <div className="text-[10px] text-blox-accent font-mono">{c.price}</div>
                                   </div>
                                   <button onClick={() => removeCase(i)} className="p-2 text-gray-600 hover:text-red-500 transition-colors bg-[#0B0E14] rounded-lg">
                                       <X size={12} />
                                   </button>
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="flex items-center justify-between mb-4 bg-[#0B0E14] p-4 rounded-xl border border-[#2A3441]">
                       <span className="text-xs font-bold text-gray-400 uppercase">Total Cost</span>
                       <span className="text-xl font-mono font-black text-white flex items-center gap-2">
                           <Moon size={18} className="text-blox-accent" fill="currentColor" />
                           {totalCost.toLocaleString()}
                       </span>
                   </div>

                   {isLoggedIn ? (
                       <button 
                        onClick={createLobby}
                        disabled={selectedCases.length === 0 || balance < totalCost}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0"
                       >
                           <Sword size={18} /> Create Battle
                       </button>
                   ) : (
                       <button 
                        onClick={onOpenLogin}
                        className="w-full py-4 bg-[#2A3441] text-gray-400 hover:text-white font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                       >
                           <Lock size={16} /> Login to Play
                       </button>
                   )}
              </div>
          </div>
      </div>
  );

  const renderPlayerColumn = (player: Player, index: number) => {
      const isWinner = battleState === 'FINISHED' && player.team === winningTeam;
      const isTeam1 = player.team === 1;

      return (
        <div key={player.id} className={`flex flex-col gap-4 min-w-0 w-full ${isWinner ? 'z-10 relative' : ''}`}>
             
             {/* Player Card */}
             <div className={`
                relative rounded-2xl p-4 flex flex-col items-center overflow-hidden transition-all duration-500 border
                ${isWinner ? 'bg-[#151B25] border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] transform scale-105' : 'bg-[#151B25] border-[#2A3441]'}
             `}>
                 {isWinner && <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500"></div>}
                 
                 <div className="relative mb-3">
                     <img src={player.avatar} className={`w-14 h-14 rounded-xl bg-[#0B0E14] object-cover border-2 ${isTeam1 ? 'border-blue-500' : 'border-red-500'}`} />
                     {isWinner && (
                         <div className="absolute -top-3 -right-3 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg animate-bounce-short">
                             <Trophy size={14} fill="currentColor" />
                         </div>
                     )}
                 </div>
                 
                 <div className="text-sm font-black text-white truncate w-full text-center">{player.name}</div>
                 
                 <div className="mt-3 bg-[#0B0E14] w-full py-2 rounded-lg flex items-center justify-center gap-2 border border-[#2A3441]">
                     <Moon size={12} className={isWinner ? 'text-yellow-500' : 'text-gray-500'} fill="currentColor" />
                     <span className={`font-mono font-bold text-base ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                         {player.totalValue.toLocaleString()}
                     </span>
                 </div>
             </div>

             {/* Spinner Track */}
             <div className="relative h-[280px] bg-[#0B0E14] border border-[#2A3441] rounded-2xl overflow-hidden shadow-inner flex flex-col">
                 {/* Top Shadow */}
                 <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0B0E14] to-transparent z-20 pointer-events-none"></div>
                 {/* Bottom Shadow */}
                 <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0B0E14] to-transparent z-20 pointer-events-none"></div>

                 {/* Center Line (Winner Indicator) */}
                 <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-yellow-500/50 z-30 pointer-events-none -translate-y-1/2 flex items-center justify-between px-1">
                     <div className="w-2 h-2 bg-yellow-500 rotate-45"></div>
                     <div className="w-2 h-2 bg-yellow-500 rotate-45"></div>
                 </div>

                 {/* Vertical Tape Container */}
                 <div className="flex-1 overflow-hidden relative">
                     <div 
                        className="w-full absolute left-0 flex flex-col items-center gap-2 pt-[140px] will-change-transform" // pt-half-height to start
                        style={{
                            transform: `translateY(${player.currentOffset}px)`,
                            transition: isSpinning ? `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0, 0.2, 1)` : 'none'
                        }}
                     >
                         {player.currentTape.map((item, idx) => (
                             <div 
                                key={idx}
                                className={`
                                    w-[80px] h-[80px] flex-shrink-0 bg-[#151B25] rounded-xl relative flex items-center justify-center border
                                    ${idx === WIN_INDEX && !isSpinning ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] z-10' : 'border-[#2A3441] opacity-60'}
                                `}
                             >
                                 <img src={item.image} className="w-14 h-14 object-contain" />
                                 <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             {/* History (Last Drop) */}
             <div className="flex-1 bg-[#151B25] border border-[#2A3441] rounded-2xl p-2 overflow-y-auto max-h-[200px] scrollbar-hide space-y-2">
                 {player.history.length === 0 && (
                     <div className="text-center text-[10px] text-gray-600 font-bold py-4 uppercase">No drops yet</div>
                 )}
                 {player.history.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-[#0B0E14] p-2 rounded-xl border border-[#2A3441] animate-slide-up">
                         <div className="w-10 h-10 rounded-lg bg-[#151B25] flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: item.color }}></div>
                             <img src={item.image} className="w-8 h-8 object-contain" />
                         </div>
                         <div className="min-w-0 flex-1">
                             <div className="text-[10px] font-black text-gray-300 truncate uppercase">{item.name}</div>
                             <div className="text-[10px] font-mono font-bold text-gray-500">{item.value} M</div>
                         </div>
                     </div>
                 ))}
             </div>

        </div>
      );
  };

  // Helper for team scores
  const team1Score = players.filter(p => p.team === 1).reduce((acc, p) => acc + p.totalValue, 0);
  const team2Score = players.filter(p => p.team === 2).reduce((acc, p) => acc + p.totalValue, 0);
  const isTeamMode = mode === '2v2' || mode === '3v3';

  return (
    <div className="w-full min-h-screen bg-[#0B0E14] text-white p-4 lg:p-8 overflow-x-hidden">
        
        {/* Breadcrumb / Header */}
        <div className="max-w-[1600px] mx-auto mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        if (battleState === 'LOBBY') leaveLobby();
                        else if (!isSpinning) window.history.back();
                    }} 
                    className="p-2 bg-[#151B25] rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="rotate-180" size={20} />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
                   <Sword className="text-red-500" size={24} />
                   CASE BATTLES
                </h1>
            </div>
            
            {battleState !== 'SETUP' && battleState !== 'LOBBY' && (
                <div className="flex items-center gap-4 bg-[#151B25] px-4 py-2 rounded-xl border border-[#2A3441]">
                     <div className="text-xs font-bold text-gray-500 uppercase">Round</div>
                     <div className="flex gap-1">
                         {selectedCases.map((_, idx) => (
                             <div 
                                key={idx} 
                                className={`w-8 h-1.5 rounded-full transition-colors ${
                                    idx < currentRound ? 'bg-emerald-500' : 
                                    idx === currentRound ? 'bg-yellow-500 animate-pulse' : 'bg-[#2A3441]'
                                }`}
                             ></div>
                         ))}
                     </div>
                </div>
            )}
        </div>

        <div className="max-w-[1600px] mx-auto">
            
            {/* Team Scoreboard (For 2v2/3v3) */}
            {(battleState === 'PLAYING' || battleState === 'FINISHED') && isTeamMode && (
                <div className="flex justify-center mb-6 animate-fade-in">
                    <div className="flex items-center gap-0 bg-[#0F1219] rounded-xl border border-[#2A3441] overflow-hidden p-1 shadow-lg">
                        <div className={`px-6 py-2 rounded-lg flex flex-col items-center transition-colors duration-500 ${team1Score > team2Score ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500'}`}>
                            <div className="text-[10px] font-black uppercase tracking-wider">Team 1</div>
                            <div className="text-xl font-mono font-black flex items-center gap-1">
                                <Moon size={14} fill="currentColor"/> {team1Score.toLocaleString()}
                            </div>
                        </div>
                        <div className="px-4 text-gray-600 font-black text-sm italic">VS</div>
                        <div className={`px-6 py-2 rounded-lg flex flex-col items-center transition-colors duration-500 ${team2Score > team1Score ? 'bg-red-500/20 text-red-500' : 'text-gray-500'}`}>
                            <div className="text-[10px] font-black uppercase tracking-wider">Team 2</div>
                            <div className="text-xl font-mono font-black flex items-center gap-1">
                                <Moon size={14} fill="currentColor"/> {team2Score.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {battleState === 'SETUP' && renderSetup()}
            {battleState === 'LOBBY' && renderLobby()}
            {(battleState === 'PLAYING' || battleState === 'FINISHED') && (
                <div 
                    className="grid gap-6 animate-fade-in" 
                    style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
                >
                    {players.map((p, i) => renderPlayerColumn(p, i))}
                </div>
            )}
            
            {battleState === 'FINISHED' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#151B25] border border-[#2A3441] p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-scale-in">
                        <Trophy size={48} className="text-yellow-500 mx-auto mb-4 animate-bounce-short" />
                        <h2 className="text-3xl font-black text-white italic uppercase mb-2">
                             {winningTeam ? (mode === '1v1' || mode === '1v1v1' || mode === '1v1v1v1' ? 'Winner!' : `Team ${winningTeam} Victory!`) : 'Battle Finished'}
                        </h2>
                        
                        {winningsShare > 0 ? (
                            <div className="mb-6">
                                <div className="text-emerald-400 font-bold text-lg mb-1">You Won!</div>
                                <div className="text-white font-mono font-bold text-xl flex items-center justify-center gap-2">
                                    <Moon size={20} className="text-blox-accent" fill="currentColor"/>
                                    +{winningsShare.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 font-bold mt-1">Split amongst team</div>
                            </div>
                        ) : (
                            <div className="text-gray-400 font-bold text-lg mb-6">Better luck next time.</div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button onClick={resetBattle} className="bg-blox-accent hover:bg-white text-black font-black px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2">
                                <RotateCcw size={16} /> PLAY AGAIN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    </div>
  );
};

export default CaseBattles;
