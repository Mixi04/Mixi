
import React, { useState, useRef, useEffect } from 'react';
import { GameProps } from '../../types';
import { Moon, Lock, ChevronLeft, Volume2, VolumeX, Info, Triangle, Sparkles, MonitorPlay } from 'lucide-react';

// --- Types ---
interface Item {
  id: string;
  name: string;
  image: string;
  value: number;
  chance: number; // The REAL chance used for logic (weighted)
  displayChance?: number; // The FAKE chance displayed to user (0-100)
  color: string; // Hex color for borders/glows
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
  items: Item[];
  color: string; // Theme color for the case
}

// --- Data Configuration ---

// Items Database
const ITEMS_DB: Record<string, Item> = {
  'bloxy-cola': {
    id: 'bloxy-cola',
    name: 'Bloxy Cola',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040144/10472779_gqx37v.webp',
    value: 50,
    chance: 0.5,
    color: '#A855F7', // Purple
    rarity: 'EPIC'
  },
  'hilarius': {
    id: 'hilarius',
    name: 'Hilarius Face',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040220/2786135_fztrxg.webp',
    value: 15,
    chance: 0.5,
    color: '#9CA3AF', // Gray
    rarity: 'COMMON'
  },
  // --- Starter Snack Case Items ---
  'snack-bloxy': {
    id: 'snack-bloxy',
    name: 'Bloxy Cola',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040144/10472779_gqx37v.webp',
    value: 50,
    chance: 0.45,
    color: '#9CA3AF', 
    rarity: 'COMMON'
  },
  'snack-cheezburger': {
    id: 'snack-cheezburger',
    name: 'Cheezburger',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040114/16726030_kwcqqx.webp',
    value: 99,
    chance: 0.35,
    color: '#9CA3AF', 
    rarity: 'COMMON'
  },
  'snack-hilarius': {
    id: 'snack-hilarius',
    name: 'Hilarius Face',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040220/2786135_fztrxg.webp',
    value: 15,
    chance: 0.15,
    color: '#9CA3AF', 
    rarity: 'COMMON'
  },
  'snack-taco': {
    id: 'snack-taco',
    name: 'Taco',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040196/15177716_fjvald.webp',
    value: 150,
    chance: 0.05,
    color: '#22C55E', 
    rarity: 'UNCOMMON'
  },

  // --- Hair Surprise Case Items ---
  'hair-shaggy': {
    id: 'hair-shaggy',
    name: 'Shaggy',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040302/20573078_wnx0cc.webp',
    value: 1486,
    chance: 0.01,
    displayChance: 1.5,
    color: '#F59E0B',
    rarity: 'LEGENDARY'
  },
  'hat-chill': {
    id: 'hat-chill',
    name: 'Chill Cap',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040478/9fdd76ff-4614-4bca-80b7-69bf4a95396c.png',
    value: 643,
    chance: 0.025,
    displayChance: 3,
    color: '#3B82F6',
    rarity: 'RARE'
  },
  'hat-goldrow': {
    id: 'hat-goldrow',
    name: 'Goldrow',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040801/dd0f8dd4-3ea3-437d-8c19-9743af0f63ce.png',
    value: 231,
    chance: 0.005,
    displayChance: 0.5,
    color: '#EAB308',
    rarity: 'RARE'
  },
  'hat-paper': {
    id: 'hat-paper',
    name: 'Paper Hat',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040452/7422f51d-6cd0-43d6-a7d8-1406ec981cca.png',
    value: 95,
    chance: 0.09,
    displayChance: 10,
    color: '#22C55E',
    rarity: 'UNCOMMON'
  },
  'hair-purple': {
    id: 'hair-purple',
    name: 'Purple Hair',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040376/430062818_zfa1pi.webp',
    value: 65,
    chance: 0.12,
    displayChance: 15,
    color: '#22C55E',
    rarity: 'UNCOMMON'
  },
  'hair-blue': {
    id: 'hair-blue',
    name: 'Blue Hair',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040257/846803597_qp8tsg.webp', 
    value: 65,
    chance: 0.38,
    displayChance: 35,
    color: '#9CA3AF',
    rarity: 'COMMON'
  },
  'hair-green': {
    id: 'hair-green',
    name: 'Green Hair',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040276/1033117580_raxw09.webp',
    value: 65,
    chance: 0.38,
    displayChance: 35,
    color: '#9CA3AF',
    rarity: 'COMMON'
  },

  // --- Fedora Frenzy Items ---
  'fedora-rainbow': {
    id: 'fedora-rainbow',
    name: 'Rainbow Fedora',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041026/f9b32f1b-92ec-45a6-9389-f9595803392a.png',
    value: 62666,
    chance: 0.3,
    color: '#EAB308',
    rarity: 'LEGENDARY'
  },
  'fedora-sparkle': {
    id: 'fedora-sparkle',
    name: 'Sparkle Time',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041012/b4f25c92-e55e-48aa-95d1-1166aeeeaa1d.png',
    value: 1676767,
    chance: 0.1,
    color: '#EAB308',
    rarity: 'LEGENDARY'
  },
  'fedora-black': {
    id: 'fedora-black',
    name: 'Black Sparkle Time',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041068/988463c1-7bfe-40a0-af26-6b88d614063f.png',
    value: 5777777,
    chance: 0.05,
    color: '#EAB308',
    rarity: 'LEGENDARY'
  },
  'fedora-sinister': {
    id: 'fedora-sinister',
    name: 'Sinister Fedora',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040952/c76bd649-3eae-4f61-ad02-7607f31bd9f9.png',
    value: 104354,
    chance: 2,
    color: '#A855F7',
    rarity: 'EPIC'
  },

  // --- Dominus Dream Items ---
  'dominus-astra': {
    id: 'dominus-astra',
    name: 'Dominus Astra',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040681/a763e4f4-04c9-4aa6-8ab0-ad8d1c605e20.png',
    value: 14333555,
    chance: 0.003,
    color: '#EF4444', 
    rarity: 'LEGENDARY'
  },
  'dominus-aureus': {
    id: 'dominus-aureus',
    name: 'Dominus Aureus',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040859/2915676e-7b55-405a-9463-add1edd88c01.png',
    value: 5100333,
    chance: 0.01,
    color: '#EAB308', 
    rarity: 'LEGENDARY'
  },
  'hat-8bit-crown': {
    id: 'hat-8bit-crown',
    name: '8 Bit Royal Crown',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040622/b9e0cc9b-db1d-4c92-b273-6186f432cc29.png',
    value: 14676,
    chance: 1,
    color: '#A855F7', 
    rarity: 'EPIC'
  },
  'hat-bucket': {
    id: 'hat-bucket',
    name: 'Bucket',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040570/cd5e06e5-0fcc-4d07-8b56-218b10b1d2a4.png',
    value: 14079,
    chance: 3,
    color: '#A855F7', 
    rarity: 'EPIC'
  },
  'hat-golden-top': {
    id: 'hat-golden-top',
    name: 'Golden Top Hat',
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040594/3042fb19-0297-449e-ae16-38a28b51ec65.png',
    value: 20222,
    chance: 1,
    color: '#EAB308',
    rarity: 'EPIC'
  }
};

// Cases Database
const AVAILABLE_CASES: Case[] = [
  {
    id: 'dominus-dream',
    name: 'Dominus Dream Case',
    price: 25000,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040681/a763e4f4-04c9-4aa6-8ab0-ad8d1c605e20.png',
    color: '#EF4444',
    items: [
        { ...ITEMS_DB['dominus-astra'], chance: 0.003, displayChance: 0.003 },
        { ...ITEMS_DB['dominus-aureus'], chance: 0.01, displayChance: 0.01 },
        { ...ITEMS_DB['fedora-black'], chance: 0.01, displayChance: 0.01 },
        { ...ITEMS_DB['fedora-sparkle'], chance: 0.05, displayChance: 0.05 },
        { ...ITEMS_DB['fedora-sinister'], chance: 0.15, displayChance: 0.15 },
        { ...ITEMS_DB['hat-8bit-crown'], chance: 1, displayChance: 1 },
        { ...ITEMS_DB['hat-bucket'], chance: 3, displayChance: 3 },
        { ...ITEMS_DB['hat-chill'], chance: 5, displayChance: 5 },
        { ...ITEMS_DB['hat-goldrow'], chance: 15, displayChance: 15 },
        { ...ITEMS_DB['snack-taco'], chance: 20, displayChance: 20 },
        { ...ITEMS_DB['snack-cheezburger'], chance: 20, displayChance: 20 },
        { ...ITEMS_DB['snack-bloxy'], chance: 35, displayChance: 35 }
    ]
  },
  {
    id: 'high-stakes',
    name: 'High Stakes',
    price: 7500,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040952/c76bd649-3eae-4f61-ad02-7607f31bd9f9.png',
    color: '#A855F7',
    items: [
        { ...ITEMS_DB['fedora-sinister'], chance: 1.5, displayChance: 1.5 }, // Nerfed from 5%
        { ...ITEMS_DB['hat-bucket'], chance: 25, displayChance: 25 },       // Nerfed from 40%
        { ...ITEMS_DB['hat-chill'], chance: 73.5, displayChance: 73.5 }     // Buffed loss chance
    ]
  },
  {
    id: 'bucket-bust',
    name: 'Bucket or Bust',
    price: 1400,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040570/cd5e06e5-0fcc-4d07-8b56-218b10b1d2a4.png',
    color: '#A855F7',
    items: [
        { ...ITEMS_DB['hat-bucket'], chance: 1, displayChance: 1 }, // 10x Payout (14k vs 1.4k cost)
        { ...ITEMS_DB['hat-chill'], chance: 49, displayChance: 49 },
        { ...ITEMS_DB['hat-goldrow'], chance: 50, displayChance: 50 }
    ]
  },
  {
    id: 'fedora-frenzy',
    name: 'Fedora Frenzy Case',
    price: 1500,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765041012/b4f25c92-e55e-48aa-95d1-1166aeeeaa1d.png',
    color: '#EAB308',
    items: [
        { ...ITEMS_DB['fedora-black'], chance: 0.05, displayChance: 0.05 },
        { ...ITEMS_DB['fedora-sparkle'], chance: 0.1, displayChance: 0.1 },
        { ...ITEMS_DB['fedora-rainbow'], chance: 0.25, displayChance: 0.3 }, // Real 0.25%, Display 0.3%
        { ...ITEMS_DB['fedora-sinister'], chance: 0.89, displayChance: 1 }, // Real 0.89%, Display 1%
        { ...ITEMS_DB['hat-goldrow'], chance: 25, displayChance: 25 },
        { ...ITEMS_DB['hat-paper'], chance: 42.55, displayChance: 42.55 }
    ]
  },
  {
    id: 'hair-surprise',
    name: 'Hair Surprise Case',
    price: 300,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040376/430062818_zfa1pi.webp',
    color: '#A855F7',
    items: [
        ITEMS_DB['hair-shaggy'],
        ITEMS_DB['hat-chill'],
        ITEMS_DB['hat-goldrow'],
        ITEMS_DB['hat-paper'],
        ITEMS_DB['hair-purple'],
        ITEMS_DB['hair-blue'],
        ITEMS_DB['hair-green']
    ]
  },
  {
    id: 'starter-snack',
    name: 'Starter Snack Case',
    price: 100,
    image: 'https://res.cloudinary.com/ddgmnys0o/image/upload/v1765040114/16726030_kwcqqx.webp',
    color: '#F59E0B',
    items: [ITEMS_DB['snack-bloxy'], ITEMS_DB['snack-cheezburger'], ITEMS_DB['snack-hilarius'], ITEMS_DB['snack-taco']]
  },
  {
    id: 'starter',
    name: 'Starter Case',
    price: 36,
    image: 'https://cdn.rostake.com/cases/1.webp',
    color: '#F59E0B',
    items: [
        { ...ITEMS_DB['bloxy-cola'], chance: 0.4, displayChance: 50 }, 
        { ...ITEMS_DB['hilarius'], chance: 0.6, displayChance: 50 }
    ]
  },
  {
    id: 'blue-steel',
    name: 'Blue Steel',
    price: 150,
    image: 'https://cdn.rostake.com/cases/1.webp', 
    color: '#3B82F6',
    items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']] 
  },
  {
    id: 'radioactive',
    name: 'Radioactive',
    price: 500,
    image: 'https://cdn.rostake.com/cases/1.webp',
    color: '#22C55E',
    items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']]
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    price: 2500,
    image: 'https://cdn.rostake.com/cases/1.webp',
    color: '#A855F7',
    items: [ITEMS_DB['bloxy-cola'], ITEMS_DB['hilarius']]
  }
];

// Configuration constants
const CARD_WIDTH = 170; 
const CARD_GAP = 6;     
const TOTAL_ITEM_WIDTH = CARD_WIDTH + CARD_GAP; 
const WIN_INDEX = 75;
const TAPE_LENGTH = 90; 
const SPIN_DURATION = 3600; 
const SPIN_SOUND_URL = "https://cdn.pixabay.com/audio/2024/08/15/audio_e17db8c011.mp3";

// --- RIGGING HELPERS ---
const readRigConfig = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const rigParam = params.get('rig');
    const target = params.get('target') || undefined;
    const oddsParam = params.get('odds');
    let odds = oddsParam != null ? Number(oddsParam) : undefined;

    const saved = localStorage.getItem('rigCases');
    if (!rigParam && saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.enabled && parsed.target) {
        if (!target) (params as any).set('target', parsed.target);
        if (odds === undefined && parsed.odds !== undefined) odds = parsed.odds;
      }
    }

    const enabled = rigParam === 'true' || (saved ? (JSON.parse(saved).enabled === true) : false);
    if (odds !== undefined && Number.isNaN(odds)) odds = undefined;
    if (typeof odds === 'number') odds = Math.max(0, Math.min(1, odds));

    return { enabled, target, odds };
  } catch {
    return { enabled: false as const, target: undefined as undefined | string, odds: undefined as undefined | number };
  }
};

const Cases: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  // State
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  
  // Multi-Spin State
  const [caseCount, setCaseCount] = useState<1 | 2 | 3 | 4>(1); 
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  // Arrays for multi-spin support (indexes 0 to 3)
  const [tapes, setTapes] = useState<Item[][]>([]);
  const [offsets, setOffsets] = useState<number[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [winItems, setWinItems] = useState<(Item | null)[]>([]);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Refs for animation measurement - Arrays for multiple tracks
  const viewportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Refs to hold deterministic precomputed winner and current tape snapshot for async access
  const winnersRef = useRef<Item[]>([]);
  const tapesRef = useRef<Item[][]>([]);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(SPIN_SOUND_URL);
    audioRef.current.volume = 0.4;
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };
  }, []);

  // Initialize tapes when case or count changes
  useEffect(() => {
    if (activeCase) {
        const initialTapes: Item[][] = [];
        const initialOffsets: number[] = [];
        
        for (let i = 0; i < caseCount; i++) {
            // Create initial static tape for visual
            initialTapes.push(Array.from({ length: 15 }).map((_, j) => activeCase.items[j % activeCase.items.length]));
            initialOffsets.push(0);
        }
        
        setTapes(initialTapes);
        tapesRef.current = initialTapes;
        setOffsets(initialOffsets);
        setWinItems(Array(caseCount).fill(null));
        setIsSpinning(false);
        setIsDemo(false);
    }
  }, [activeCase, caseCount]);

  // --- Game Logic ---

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

  const getWeightedExcluding = (items: Item[], excludeId: string) => {
    const pool = items.filter(i => i.id !== excludeId);
    if (pool.length === 0) return items.find(i => i.id === excludeId) || items[0];
    return getWeightedOutcome(pool);
  };

  const getRigAwareOutcome = (items: Item[]) => {
    const rig = readRigConfig();
    if (!rig.enabled) return getWeightedOutcome(items);

    let targetItem = rig.target ? items.find(i => i.id === rig.target) : undefined;
    if (!targetItem) {
      targetItem = items.reduce((best, curr) => (!best || curr.value > best.value ? curr : best), undefined as Item|undefined)!;
    }

    if (rig.odds === 1 || rig.odds === undefined) {
      return targetItem!;
    }

    if (rig.odds > 0 && rig.odds < 1) {
      if (Math.random() <= rig.odds) return targetItem!;
      return getWeightedExcluding(items, targetItem!.id);
    }

    return getWeightedOutcome(items);
  };

  const openCase = (demoMode = false) => {
    if (!activeCase) return;
    if (!demoMode && !isLoggedIn) {
        onOpenLogin();
        return;
    }
    const totalCost = activeCase.price * caseCount;
    if (!demoMode && balance < totalCost) return;
    if (isSpinning) return;

    // 1. Transaction (Skip if demo)
    setIsDemo(demoMode);
    if (!demoMode) {
        updateBalance(-totalCost);
        onPlay(totalCost);
    }

    // 2. Prepare Spinners
    const newTapes: Item[][] = [];
    const newWinners: Item[] = [];
    
    for (let c = 0; c < caseCount; c++) {
        // Determine Winner (use rig-aware selection)
        const winner = getRigAwareOutcome(activeCase.items);
        newWinners.push(winner);

        // Generate Tape
        const newTape: Item[] = [];
        const cycleLen = activeCase.items.length;
        const cycleOffset = Math.floor(Math.random() * cycleLen); 
        for (let i = 0; i < TAPE_LENGTH; i++) {
            if (i === WIN_INDEX) {
                newTape.push(winner);
            } else {
                const idx = (i + cycleOffset) % cycleLen;
                newTape.push(activeCase.items[idx]);
            }
        }
        newTapes.push(newTape);
    }

    // Store refs
    tapesRef.current = newTapes;
    winnersRef.current = newWinners; 
    
    // 3. Play Sound
    if (audioRef.current && !isMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    }

    // 4. Reset Animation
    setIsSpinning(true);
    setWinItems(Array(caseCount).fill(null));
    setIsResetting(true); 
    setTapes(newTapes);
    setOffsets(Array(caseCount).fill(0)); // Reset offsets to 0

    // 5. Trigger Spin
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Calculate offsets for ALL tracks
        const nextOffsets: number[] = [];

        for (let c = 0; c < caseCount; c++) {
             try {
                const vp = viewportRefs.current[c];
                const track = trackRefs.current[c];
                
                if (vp && track) {
                    const targetEl = vp.querySelector(`[data-tape-index="${WIN_INDEX}"]`) as HTMLElement | null;
                    const trackRect = track.getBoundingClientRect();

                    if (targetEl) {
                        const targetRect = targetEl.getBoundingClientRect();
                        const targetCenter = targetRect.left + targetRect.width / 2;
                        // Compare to TRACK center
                        const trackCenter = trackRect.left + trackRect.width / 2;

                        // Get current matrix transform
                        const style = window.getComputedStyle(vp);
                        const matrix = style.transform;
                        let currentTranslateX = 0;
                        if (matrix && matrix !== 'none') {
                            const m = matrix.match(/matrix.*\((.+)\)/)?.[1];
                            if (m) {
                                const vals = m.split(',').map(v => parseFloat(v.trim()));
                                if (vals.length >= 5 && !Number.isNaN(vals[4])) currentTranslateX = vals[4];
                            }
                        }

                        const currentOffset = -currentTranslateX;
                        // Exact math preserved from user code
                        const desiredOffset = Math.round(Math.max(0, currentOffset + (targetCenter - trackCenter)));
                        nextOffsets.push(desiredOffset);
                    } else {
                        // Fallback math
                        const trackWidth = track.clientWidth;
                        const winningCardCenter = (WIN_INDEX * TOTAL_ITEM_WIDTH) + (CARD_WIDTH / 2);
                        const trackCenter = trackWidth / 2;
                        nextOffsets.push(Math.max(0, Math.round(winningCardCenter - trackCenter)));
                    }
                } else {
                    nextOffsets.push(0);
                }
             } catch (e) {
                 nextOffsets.push(0);
             }
        }

        // Enable transition and apply offsets
        setIsResetting(false);
        setTimeout(() => setOffsets(nextOffsets), 20);

        // 6. End Game
        setTimeout(() => {
          setIsSpinning(false);
          const finalWins = tapesRef.current.map((tape, idx) => tape?.[WIN_INDEX] ?? winnersRef.current[idx]);
          setWinItems(finalWins);
          
          // Credit only if not demo
          if (!demoMode) {
              const totalWon = finalWins.reduce((sum, item) => sum + (item?.value || 0), 0);
              updateBalance(totalWon);
          }
        }, SPIN_DURATION);
      });
    });
  };

  // --- Views ---

  // LOBBY VIEW
  if (!activeCase) {
      return (
        <div className="w-full animate-fade-in max-w-7xl mx-auto p-6 md:p-8">
             <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3 drop-shadow-md">
                        CASE BATTLES
                    </h2>
                    <p className="text-gray-500 font-bold text-sm mt-1">Select a case to start opening</p>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {AVAILABLE_CASES.map((c) => (
                    <div 
                        key={c.id}
                        onClick={() => setActiveCase(c)}
                        className="group bg-[#151B25] border border-[#2A3441] hover:border-blox-accent/50 rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col items-center"
                    >
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative z-10 w-36 h-36 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                             <div className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-40 blur-2xl group-hover:opacity-60 transition-opacity" style={{ backgroundImage: `url(${c.image})` }}></div>
                             <img src={c.image} alt={c.name} className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
                        </div>

                        <div className="relative z-10 text-center w-full mt-auto">
                            <h3 className="text-sm font-black text-white uppercase truncate mb-3 tracking-wide">{c.name}</h3>
                            <button className="w-full py-3 bg-[#0B0E14] border border-[#2A3441] group-hover:border-blox-accent/30 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-[#2A3441]">
                                <Moon size={14} className="text-blox-accent" fill="currentColor" />
                                <span className="text-white font-mono font-bold text-sm">{c.price}</span>
                            </button>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      );
  }

  // GAME VIEW
  return (
    <div className="w-full min-h-screen bg-[#0B0E14] text-white flex flex-col">
       
       {/* Top Navigation Bar */}
       <div className="w-full border-b border-white/5 bg-[#0F1219]">
           <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <button 
                    onClick={() => !isSpinning && setActiveCase(null)} 
                    disabled={isSpinning}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151B25] border border-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 font-bold text-xs uppercase tracking-wide hover:border-white/10 active:scale-95"
                >
                    <ChevronLeft size={14} /> Back
                </button>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 transition-colors ${isMuted ? 'text-gray-600' : 'text-gray-300 hover:text-white'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
           </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col items-center pt-6 pb-20 px-4 overflow-y-auto scrollbar-hide">
            
            {/* Case Header */}
            <div className="flex flex-col items-center mb-6 animate-fade-in relative z-10">
                <div className="relative mb-2 group cursor-pointer">
                     <div className="absolute inset-0 bg-blox-accent/20 blur-[60px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity animate-pulse-slow"></div>
                     <img src={activeCase.image} alt={activeCase.name} className="w-24 h-24 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 animate-float" />
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 drop-shadow-xl">{activeCase.name}</h1>
                <div className="flex items-center gap-2 bg-[#151B25] px-3 py-1 rounded-full border border-white/5">
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Cost:</span>
                     <span className="text-blox-accent font-mono font-bold text-xs">{activeCase.price} M</span>
                     {caseCount > 1 && <span className="text-xs font-black text-white bg-white/10 px-1.5 rounded ml-1">x{caseCount}</span>}
                </div>
            </div>

            {/* MULTI SPINNER CONTAINER */}
            <div className="flex flex-col gap-4 w-full max-w-[1200px] mb-8 select-none">
                 {/* Map through active case count to render spinners */}
                 {Array.from({ length: caseCount }).map((_, spinnerIdx) => (
                    <div key={spinnerIdx} className="w-full relative group">
                        
                        {/* ----------------- INDICATOR / LASER ----------------- */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center justify-between h-full py-0.5">
                            <div className="text-[#F59E0B] drop-shadow-[0_0_15px_rgba(245,158,11,1)] filter transform scale-75">
                                <Triangle size={20} fill="currentColor" className="rotate-180" />
                            </div>
                            <div className={`w-[2px] h-full rounded-full transition-all duration-300 relative
                                ${winItems[spinnerIdx] && !isSpinning ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,1)]' : 'bg-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.8)]'}
                            `}></div>
                            <div className="text-[#F59E0B] drop-shadow-[0_0_15px_rgba(245,158,11,1)] filter transform scale-75">
                                <Triangle size={20} fill="currentColor" />
                            </div>
                        </div>

                        {/* The Track */}
                        <div 
                            ref={(el) => { trackRefs.current[spinnerIdx] = el; }}
                            className={`bg-[#0A0C10] border-y border-[#1E293B] relative overflow-hidden shadow-2xl flex items-center transition-all duration-500
                                ${caseCount >= 3 ? 'h-[180px]' : 'h-[260px]'} 
                            `}
                        >
                            {/* Clean Side Fades */}
                            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0B0E14] to-transparent z-30 pointer-events-none"></div>
                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0B0E14] to-transparent z-30 pointer-events-none"></div>

                            {/* Moving Tape */}
                            <div 
                                ref={(el) => { viewportRefs.current[spinnerIdx] = el; }}
                                className="flex items-center h-full will-change-transform pl-[50vw] transform-gpu"
                                style={{ 
                                    transform: `translateX(${-(offsets[spinnerIdx] || 0)}px)`,
                                    transition: isResetting ? 'none' : `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0, 0.2, 1)` 
                                }}
                            >
                                {(tapes[spinnerIdx] || []).map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        data-tape-item
                                        data-tape-index={idx}
                                        style={{ width: `${CARD_WIDTH}px`, marginRight: `${CARD_GAP}px` }}
                                        className={`flex-shrink-0 bg-[#14171F] rounded-lg relative overflow-hidden transition-all duration-300 flex flex-col shadow-lg z-10 backface-hidden transform-gpu
                                            ${caseCount >= 3 ? 'h-[150px]' : 'h-[220px]'}
                                            ${idx === WIN_INDEX && winItems[spinnerIdx] && !isSpinning ? 'ring-2 ring-[#F59E0B] shadow-[0_0_50px_rgba(245,158,11,0.6)] scale-105 z-30 brightness-110' : 'border border-[#2A3441]/50'}
                                        `}
                                    >
                                        <div className="h-1.5 w-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }}></div>
                                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                                        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${item.color}, transparent 80%)` }}></div>
                                        
                                        <div className="flex-1 flex items-center justify-center p-4 relative">
                                            <img src={item.image} alt={item.name} className={`object-contain drop-shadow-md transform hover:scale-105 transition-transform duration-500 ${caseCount >= 3 ? 'w-20 h-20' : 'w-28 h-28'}`} />
                                        </div>
                                        
                                        <div className="p-3 bg-[#0E1016] border-t border-white/5 flex flex-col gap-1 relative z-10">
                                            <div className="text-xs font-black text-gray-200 uppercase truncate tracking-wide">{item.name}</div>
                                            <div className="text-[10px] font-bold text-gray-500 font-mono flex items-center justify-between">
                                                <span className="flex items-center gap-1"><Moon size={10} className="text-blox-accent" fill="currentColor"/> {item.value}</span>
                                            </div>
                                        </div>

                                        {/* Flash Overlay on Win */}
                                        {idx === WIN_INDEX && winItems[spinnerIdx] && !isSpinning && (
                                            <div className="absolute inset-0 bg-white/40 animate-pulse mix-blend-overlay pointer-events-none"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 ))}
            </div>

            {/* CONTROLS BAR */}
            <div className="w-full max-w-3xl bg-[#151921] border border-[#2A3441] rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl mb-12 relative overflow-hidden">
                 
                 {/* Count Selector */}
                 <div className="flex bg-[#0B0E14] p-1 rounded-xl border border-[#2A3441]">
                     {[1, 2, 3, 4].map((num) => (
                         <button 
                            key={num}
                            onClick={() => setCaseCount(num as any)}
                            disabled={isSpinning}
                            className={`w-12 h-9 rounded-lg text-xs font-black transition-all ${
                                caseCount === num 
                                ? 'bg-[#2A3441] text-white shadow-lg shadow-black/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                         >
                            {num}x
                         </button>
                     ))}
                 </div>

                 {/* Open Button */}
                 {isLoggedIn ? (
                     <button 
                        onClick={() => openCase(false)}
                        disabled={isSpinning || balance < (activeCase.price * caseCount)}
                        className="flex-1 h-11 bg-lime-400 hover:bg-lime-300 disabled:bg-[#2A3441] disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black text-sm uppercase tracking-wide rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 border-b-2 border-lime-600 active:border-b-0 active:translate-y-0.5 disabled:border-transparent relative overflow-hidden group"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                        {isSpinning ? (
                            <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></span> OPENING...</span>
                        ) : (
                            <>
                                OPEN FOR <Moon size={16} fill="currentColor" /> {activeCase.price * caseCount}
                            </>
                        )}
                     </button>
                 ) : (
                     <button onClick={onOpenLogin} className="flex-1 h-11 bg-[#2A3441] text-gray-300 font-bold uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-[#354152] transition-colors border border-white/5 text-xs">
                         <Lock size={14} /> Log in to Open
                     </button>
                 )}

                 {/* Demo Button */}
                 <button 
                    onClick={() => openCase(true)}
                    disabled={isSpinning}
                    className="h-11 px-4 bg-[#1F2530] text-gray-400 font-bold text-[10px] uppercase rounded-xl border border-[#2A3441] hover:text-white hover:border-white/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                     <MonitorPlay size={14} /> Demo
                 </button>
            </div>

            {/* POSSIBLE DROPS */}
            <div className="w-full max-w-5xl">
                 <div className="flex items-center gap-2 mb-4">
                     <div className="bg-[#151B25] p-1.5 rounded-md border border-white/10">
                        <Info size={14} className="text-gray-400" />
                     </div>
                     <h3 className="text-sm font-black text-white uppercase tracking-wide">Possible Drops</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     {activeCase.items.map((item, idx) => (
                         <div 
                            key={`${item.id}-${idx}`} 
                            className={`bg-[#151921] border border-[#2A3441] rounded-xl p-3 relative group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:border-white/10 overflow-hidden cursor-default`}
                         >
                             <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ backgroundColor: item.color }}></div>
                             
                             <div className="flex justify-between items-start mb-2 relative z-10">
                                 <span className="text-[9px] font-bold text-gray-400 bg-[#0B0E14] px-1.5 py-0.5 rounded border border-white/5 group-hover:text-white transition-colors group-hover:border-white/20">
                                     {item.displayChance ? item.displayChance.toFixed(2) : (item.chance * 100).toFixed(2)}%
                                 </span>
                             </div>

                             <div className="h-24 flex items-center justify-center relative z-10">
                                 <div className="absolute inset-0 bg-contain bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" style={{ backgroundImage: `url(${item.image})` }}></div>
                                 <img src={item.image} alt={item.name} className="w-20 h-20 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                             </div>

                             <div className="mt-3 relative z-10">
                                 <div className={`text-xs font-black uppercase truncate transition-colors ${item.rarity === 'LEGENDARY' ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-gray-200 group-hover:text-white'}`}>{item.name}</div>
                                 <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center justify-between">
                                     <span className="flex items-center gap-1"><Moon size={10} fill="currentColor" /> {item.value}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            {/* WIN MODAL */}
            {winItems.every(i => i !== null) && !isSpinning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setWinItems(Array(caseCount).fill(null))}></div>
                    
                    <div className="bg-[#0B0E14] border border-[#2A3441] p-8 rounded-[32px] shadow-[0_0_80px_rgba(132,204,22,0.2)] text-center transform scale-100 relative z-10 flex flex-col items-center max-w-3xl w-full animate-scale-in overflow-hidden">
                        
                        {/* Background Light */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-lime-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                        
                        {isDemo && (
                            <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-2 py-1 rounded border border-yellow-500/30">DEMO MODE</div>
                        )}

                        <div className="text-4xl font-black italic text-white uppercase mb-8 drop-shadow-md flex items-center gap-3">
                            <Sparkles className="text-lime-400" size={32} />
                            YOU WON!
                            <Sparkles className="text-lime-400" size={32} />
                        </div>

                        {/* Grid of Won Items */}
                        <div className={`grid gap-6 w-full mb-8 ${caseCount === 1 ? 'grid-cols-1 justify-items-center' : 'grid-cols-2 md:grid-cols-4'}`}>
                            {winItems.map((item, idx) => item && (
                                <div key={idx} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="relative mb-4 group w-full flex justify-center">
                                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000"></div>
                                        <div className="relative w-32 h-32 flex items-center justify-center bg-[#151B25] rounded-2xl border border-white/5 shadow-lg">
                                             <img src={item.image} alt={item.name} className="w-24 h-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-float" />
                                             <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-white uppercase truncate w-full">{item.name}</div>
                                    <div className="text-gray-400 font-bold text-xs mt-1 flex items-center gap-1 bg-[#151B25] px-2 py-1 rounded border border-white/5">
                                        <Moon size={10} className="text-blox-accent" fill="currentColor" /> {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm relative z-20">
                            <button onClick={() => setWinItems(Array(caseCount).fill(null))} className="py-3.5 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-xl transition-colors text-xs uppercase border border-white/5">Close</button>
                            <button 
                                onClick={() => openCase(isDemo)} 
                                disabled={!isDemo && balance < (activeCase.price * caseCount)} 
                                className="py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-black rounded-xl transition-colors shadow-lg shadow-lime-500/20 text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Spin Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};

export default Cases;
