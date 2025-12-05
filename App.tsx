
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import CoinFlip from './components/games/CoinFlip';
import Crash from './components/games/Crash';
import Mines from './components/games/Mines';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import WalletModal from './components/WalletModal';
import { UserState, AuthMode } from './types';
import { 
    Rocket, Coins, Bomb, ArrowUpCircle, Sword, 
    Castle, Crown, Box, LayoutGrid, ChevronRight 
} from 'lucide-react';

// Level definitions must match ProfileModal.tsx
const LEVEL_SYSTEM = [
  { level: 1, reward: 100, xpRequired: 100 },
  { level: 2, reward: 250, xpRequired: 500 },
  { level: 3, reward: 500, xpRequired: 1500 },
  { level: 4, reward: 1000, xpRequired: 3000 },
  { level: 5, reward: 1500, xpRequired: 5000 },
  { level: 6, reward: 2000, xpRequired: 10000 },
  { level: 7, reward: 3500, xpRequired: 20000 },
  { level: 8, reward: 5000, xpRequired: 50000 },
  { level: 9, reward: 7500, xpRequired: 100000 },
  { level: 10, reward: 15000, xpRequired: 250000 },
];

const CLOUD_IMG_URL = "https://res.cloudinary.com/ddgmnys0o/image/upload/v1764974680/83816441-abca-4572-96f9-4cf14f3a8f09.png";

const App: React.FC = () => {
  // Default Initial State - All users start level 0 and 0 balance
  const [user, setUser] = useState<UserState>({
        balance: 0,
        username: 'Guest',
        isLoggedIn: false,
        level: 0,
        xp: 0,
        claimedLevels: []
  });

  const [currentPage, setCurrentPage] = useState('HOME');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [authMode, setAuthMode] = useState<AuthMode>('SIGNUP');

  // Load from local storage and migrate if necessary
  useEffect(() => {
    // Check for MoonBlox User
    const saved = localStorage.getItem('moonblox_user');
    if (saved) {
        const parsed = JSON.parse(saved);
        setUser({
            ...parsed,
            level: parsed.level ?? 0,
            xp: parsed.xp ?? 0,
            claimedLevels: parsed.claimedLevels ?? []
        });
    } else {
        // Migration: Check for BloxSim User
        const old = localStorage.getItem('bloxsim_user');
        if (old) {
            const parsed = JSON.parse(old);
             setUser({
                ...parsed,
                level: parsed.level ?? 0,
                xp: parsed.xp ?? 0,
                claimedLevels: parsed.claimedLevels ?? []
            });
            // Clean up old key
            localStorage.removeItem('bloxsim_user');
        }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (user.isLoggedIn) localStorage.setItem('moonblox_user', JSON.stringify(user));
  }, [user]);

  const updateBalance = (amount: number) => {
      setUser(p => ({ 
        ...p, 
        balance: p.balance + amount
      }));
  };

  // Called whenever a user wagers money in a game
  const handleGamePlay = (wagerAmount: number) => {
      setUser(p => {
          // 1 XP per 1 Coin wagered
          const xpGain = Math.floor(wagerAmount); 
          const newXp = (p.xp || 0) + xpGain;
          
          let newLevel = p.level || 0;
          
          // Check for Level Up
          for (const tier of LEVEL_SYSTEM) {
              if (newXp >= tier.xpRequired && tier.level > newLevel) {
                  newLevel = tier.level;
              }
          }
          
          return { 
            ...p, 
            xp: newXp,
            level: newLevel
          };
      });
  };

  const handleLogin = (d: Partial<UserState>) => { 
      setUser(p => ({ 
          ...p, 
          ...d, 
          isLoggedIn: true,
          // Ensure these exist on login
          level: d.level ?? 0,
          xp: d.xp ?? 0,
          claimedLevels: d.claimedLevels ?? []
      })); 
      setIsAuthModalOpen(false); 
  };

  const handleLogout = () => { 
      localStorage.removeItem('moonblox_user'); 
      setUser({ 
          balance: 0, 
          username: 'Guest', 
          isLoggedIn: false, 
          level: 0, 
          xp: 0, 
          claimedLevels: [] 
      }); 
      setCurrentPage('HOME'); 
  };

  const handleUpdateProfile = (updates: Partial<UserState>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleClaimReward = (level: number, reward: number) => {
    if (user.claimedLevels.includes(level)) return;
    if (user.level < level) return; // Should be blocked by UI, but good safety

    setUser(prev => ({
        ...prev,
        balance: prev.balance + reward,
        claimedLevels: [...prev.claimedLevels, level]
    }));
  };

  const handleOpenLogin = () => {
      setAuthMode('LOGIN');
      setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
      setAuthMode('SIGNUP');
      setIsAuthModalOpen(true);
  };

  const handleOpenWallet = (tab: 'DEPOSIT' | 'WITHDRAW') => {
      if (!user.isLoggedIn) {
          handleOpenLogin();
          return;
      }
      setWalletTab(tab);
      setIsWalletModalOpen(true);
  };

  // --- Components ---

  const GameCardLarge = ({ title, color, icon: Icon, image, onClick }: any) => (
      <div 
        onClick={onClick}
        className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group border border-blox-border/50 hover:border-blox-accent transition-all duration-300 bg-blox-surface/40 backdrop-blur-xl shadow-lg"
      >
         <div className={`absolute inset-0 opacity-10 ${color} group-hover:opacity-20 transition-opacity`}></div>
         {/* Placeholder Patterns */}
         <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-105 transition-transform duration-500">
             {image ? image : <Icon size={80} />}
         </div>
         
         <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
             <div className="bg-black/30 p-2 rounded-lg backdrop-blur-sm">
                <Icon size={18} className="text-white" />
             </div>
             <span className="font-black text-lg text-white uppercase tracking-wider drop-shadow-md">{title}</span>
         </div>
         
         <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
             <div className="bg-blox-accent text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg">PLAY NOW</div>
         </div>
      </div>
  );

  const GameCardSmall = ({ title, icon: Icon, color, isNew, onClick, balance }: any) => (
      <div 
        onClick={onClick}
        className="bg-blox-surface/40 backdrop-blur-xl border border-blox-border/50 rounded-2xl p-4 h-32 relative group cursor-pointer hover:border-blox-accent transition-all overflow-hidden shadow-lg"
      >
          <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`}></div>
          
          <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-black/20 p-1.5 rounded-lg">
                    <Icon size={16} className="text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-white uppercase text-sm">{title}</span>
              </div>
              {isNew && <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded border border-[#F59E0B]/30">New</span>}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-blox-surface to-transparent">
             <span className="text-blox-accent font-bold text-xs uppercase tracking-widest">Click to Play</span>
          </div>

          <div className="mt-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
             <Icon size={40} className={`drop-shadow-lg opacity-80 ${color.replace('bg-', 'text-')}`} />
          </div>
          
          {/* Jackpot/Pot display simulator */}
          {balance && (
              <div className="absolute bottom-3 left-3 bg-black/40 px-2 py-1 rounded border border-white/5 flex items-center gap-1 group-hover:opacity-0 transition-opacity">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] text-black font-bold">M</div>
                  <span className="text-[10px] font-mono text-yellow-500">{balance}</span>
              </div>
          )}
      </div>
  );

  const Home = () => (
      <div className="p-6 max-w-[1600px] mx-auto animate-fade-in pb-20 relative z-10">
          
          <div className="flex items-center justify-center mb-10">
               <div className="bg-blox-surface/60 backdrop-blur-2xl border border-white/10 px-10 py-3 rounded-2xl shadow-2xl relative group overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blox-surface/80 border border-blox-border rounded-full p-2 shadow-lg">
                       <Crown size={20} className="text-[#F59E0B] fill-[#F59E0B] drop-shadow-md" />
                   </div>
                   <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-yellow-300 tracking-[0.2em] uppercase mt-2">MoonBlox Originals</h2>
               </div>
          </div>

          {/* Featured Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <GameCardLarge 
                title="Cases" 
                color="bg-blue-600" 
                icon={Box} 
                image={<div className="w-32 h-32 bg-gradient-to-tr from-blue-500/80 to-cyan-400/80 rounded-xl transform rotate-12 shadow-2xl border border-white/10 backdrop-blur-sm"></div>}
                onClick={() => {}} 
              />
              <GameCardLarge 
                title="Case Battles" 
                color="bg-red-600" 
                icon={Sword} 
                image={
                    <div className="flex gap-4 items-center">
                         <div className="w-20 h-20 bg-red-500/80 rounded-lg transform -rotate-6 border border-white/20 backdrop-blur-sm shadow-xl"></div>
                         <div className="text-4xl font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">VS</div>
                         <div className="w-20 h-20 bg-blue-500/80 rounded-lg transform rotate-6 border border-white/20 backdrop-blur-sm shadow-xl"></div>
                    </div>
                }
                onClick={() => {}} 
              />
              <GameCardLarge 
                title="Towers" 
                color="bg-yellow-600" 
                icon={Castle} 
                image={
                    <div className="flex flex-col gap-1 items-center">
                        <div className="w-16 h-8 bg-yellow-500/40 rounded-md backdrop-blur-sm"></div>
                        <div className="w-20 h-8 bg-yellow-500/60 rounded-md backdrop-blur-sm"></div>
                        <div className="w-24 h-8 bg-yellow-500/80 rounded-md shadow-lg border-t border-white/20 backdrop-blur-sm"></div>
                    </div>
                }
                onClick={() => {}} 
              />
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
               <GameCardSmall 
                    title="Crash" 
                    icon={Rocket} 
                    color="bg-red-500" 
                    balance="200,000"
                    onClick={() => setCurrentPage('CRASH')} 
               />
               <GameCardSmall 
                    title="Blackjack" 
                    icon={LayoutGrid} 
                    color="bg-indigo-500" 
                    onClick={() => {}} 
               />
               <GameCardSmall 
                    title="Coinflip" 
                    icon={Coins} 
                    color="bg-yellow-500" 
                    isNew 
                    onClick={() => setCurrentPage('COINFLIP')} 
               />
               <GameCardSmall 
                    title="Mines" 
                    icon={Bomb} 
                    color="bg-emerald-500" 
                    onClick={() => setCurrentPage('MINES')} 
               />
          </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-blox-text font-sans overflow-hidden">
        {/* Mobile Backdrop */}
        {isChatOpen && (
            <div 
                className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-md"
                onClick={() => setIsChatOpen(false)}
            ></div>
        )}

        {/* Left Sidebar Chat - Responsive */}
        <div className={`fixed inset-y-0 left-0 z-50 h-full bg-blox-surface/80 backdrop-blur-2xl lg:bg-blox-surface/80 lg:relative lg:block transition-all duration-300 ease-in-out transform border-r border-white/5 shadow-2xl
            ${isChatOpen ? 'translate-x-0 w-[300px]' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
        `}>
             <Chat 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                username={user.username}
                isLoggedIn={user.isLoggedIn}
                onOpenLogin={handleOpenLogin}
             />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
             <Navbar 
                user={user} 
                onLogout={handleLogout} 
                onOpenLogin={handleOpenLogin}
                onOpenSignup={handleOpenSignup}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenWallet={handleOpenWallet}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
             />
             
             <main className="flex-1 overflow-y-auto relative scrollbar-hide">
                  
                  {/* Atmospheric Night Background (The Cloud Template) */}
                  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0c14]">
                      {/* Deep Midnight Gradient Base */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#0f172a] to-[#020617]"></div>

                      {/* Stars Layer */}
                      {Array.from({ length: 50 }).map((_, i) => (
                          <div 
                            key={i}
                            className="absolute bg-white rounded-full animate-twinkle"
                            style={{
                                width: Math.random() * 3 + 'px',
                                height: Math.random() * 3 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                animationDelay: Math.random() * 5 + 's',
                                opacity: Math.random()
                            }}
                          ></div>
                      ))}

                      {/* Giant Moon Glow */}
                      <div className="absolute -top-[100px] right-[10%] w-[300px] h-[300px] rounded-full bg-yellow-100/10 blur-[100px] animate-pulse-slow opacity-50"></div>
                      
                      {/* --- CLOUD LAYERS (Using provided image) --- */}
                      
                      {/* Left Side Cloud - Soft & Dreamy */}
                      <img 
                        src={CLOUD_IMG_URL} 
                        alt="" 
                        className="absolute top-1/2 -left-[10%] w-[50%] max-w-[800px] -translate-y-1/2 opacity-[0.20] blur-sm animate-float"
                      />

                      {/* Right Side Cloud - Mirrored */}
                      <img 
                        src={CLOUD_IMG_URL} 
                        alt="" 
                        className="absolute top-1/2 -right-[10%] w-[50%] max-w-[800px] -translate-y-1/2 scale-x-[-1] opacity-[0.20] blur-sm animate-float-delayed"
                      />

                      {/* Top Edge Cloud - Faded */}
                      <img 
                        src={CLOUD_IMG_URL} 
                        alt="" 
                        className="absolute -top-[15%] left-1/2 w-[60%] max-w-[1000px] -translate-x-1/2 opacity-[0.10] blur-md"
                      />

                      {/* Bottom Edge Cloud - Faded */}
                      <img 
                        src={CLOUD_IMG_URL} 
                        alt="" 
                        className="absolute -bottom-[15%] left-1/2 w-[70%] max-w-[1200px] -translate-x-1/2 opacity-[0.10] blur-md"
                      />

                      {/* Foreground Mist Overlay for Seamless Blending */}
                      <div className="absolute bottom-0 w-full h-[200px] bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10 pb-10 min-h-full">
                    {currentPage === 'HOME' && <Home />}
                    {currentPage === 'CRASH' && (
                        <div className="p-6 max-w-7xl mx-auto">
                            <button onClick={() => setCurrentPage('HOME')} className="mb-4 text-gray-500 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
                                <ChevronRight className="rotate-180" size={16}/> Back to Home
                            </button>
                            <Crash 
                                balance={user.balance} 
                                updateBalance={updateBalance} 
                                onPlay={handleGamePlay}
                                isLoggedIn={user.isLoggedIn}
                                onOpenLogin={handleOpenLogin}
                            />
                        </div>
                    )}
                    {currentPage === 'COINFLIP' && (
                        <div className="p-6 max-w-6xl mx-auto">
                             <button onClick={() => setCurrentPage('HOME')} className="mb-4 text-gray-500 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
                                <ChevronRight className="rotate-180" size={16}/> Back to Home
                            </button>
                            <CoinFlip 
                                balance={user.balance} 
                                updateBalance={updateBalance} 
                                onPlay={handleGamePlay}
                                isLoggedIn={user.isLoggedIn}
                                onOpenLogin={handleOpenLogin}
                            />
                        </div>
                    )}
                    {currentPage === 'MINES' && (
                        <div className="p-6 max-w-6xl mx-auto">
                             <button onClick={() => setCurrentPage('HOME')} className="mb-4 text-gray-500 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
                                <ChevronRight className="rotate-180" size={16}/> Back to Home
                            </button>
                            <Mines 
                                balance={user.balance} 
                                updateBalance={updateBalance} 
                                onPlay={handleGamePlay}
                                isLoggedIn={user.isLoggedIn}
                                onOpenLogin={handleOpenLogin}
                            />
                        </div>
                    )}
                  </div>
             </main>
        </div>
        
        {isAuthModalOpen && <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />}
        {isSettingsModalOpen && user.isLoggedIn && (
            <SettingsModal 
                user={user} 
                onUpdate={handleUpdateProfile} 
                onClose={() => setIsSettingsModalOpen(false)} 
            />
        )}
        {isProfileModalOpen && user.isLoggedIn && (
            <ProfileModal 
                user={user} 
                onClose={() => setIsProfileModalOpen(false)} 
                onClaimReward={handleClaimReward}
            />
        )}
        {isWalletModalOpen && user.isLoggedIn && (
            <WalletModal
                user={user}
                onClose={() => setIsWalletModalOpen(false)}
                onDeposit={(amount) => updateBalance(amount)}
                onWithdraw={(amount) => updateBalance(-amount)}
                initialTab={walletTab}
            />
        )}
    </div>
  );
};

export default App;
