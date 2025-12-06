
import React, { useState, useEffect, memo } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import CoinFlip from './components/games/CoinFlip';
import Crash from './components/games/Crash';
import Mines from './components/games/Mines';
import Blackjack from './components/games/Blackjack';
import Cases from './components/games/Cases';
import CaseBattles from './components/games/CaseBattles';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import WalletModal from './components/WalletModal';
import Leaderboard from './components/Leaderboard';
import UserStatsModal from './components/UserStatsModal';
import AffiliatesModal from './components/AffiliatesModal';
import TipRainModal from './components/TipRainModal';
import AdminPanel from './components/AdminPanel'; // Import Admin Panel
import { UserState, AuthMode, PublicProfile } from './types';
import { supabase } from './supabaseClient';
import { 
    Rocket, Coins, Bomb, ArrowUpCircle, Sword, 
    Castle, Crown, Box, LayoutGrid, ChevronRight, Play, ShieldAlert 
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

// Game Cover Images
const COVER_IMAGES = {
    BLACKJACK: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764978071/0a6f6930-eda4-4969-b5df-1243d63d67b9.png",
    MINES: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764978031/d0eed63e-3985-4b14-ac5a-11503b92b728.png",
    COINFLIP: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764978020/ef85ab4d-a03b-4b14-949b-07fcde55ec3d.png",
    CRASH: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764978237/b902a774-3fdb-4f5e-979e-74edc33d7f6e.png",
    CASES: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764980765/bd77977d-260c-48fa-b958-33245b1da923.png",
    CASE_BATTLES: "https://res.cloudinary.com/devlfz6tf/image/upload/v1764981435/322ccbf5-f20f-4b0c-8490-85ff42869ace.png"
};

// --- Optimized Components ---
const GameCardSmall = memo(({ title, icon: Icon, color, isNew, badge, onClick, coverImage }: any) => (
  <div 
    onClick={onClick}
    className="relative aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-blox-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-[#151921]"
  >
      {/* Image Layer */}
      {coverImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
            style={{ backgroundImage: `url(${coverImage})` }}
          >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent"></div>
          </div>
      )}
      
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
              <div className="bg-[#0B0E14]/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 group-hover:bg-blox-accent group-hover:text-black transition-colors duration-300 shadow-lg">
                  <Icon size={20} className="text-gray-300 group-hover:text-black" />
              </div>
              {badge && (
                  <span className="bg-[#F59E0B] text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)]">{badge}</span>
              )}
              {isNew && !badge && (
                  <span className="bg-[#F59E0B] text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)]">New</span>
              )}
          </div>
          
          <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blox-accent transition-colors drop-shadow-lg">{title}</h3>
          </div>
      </div>
  </div>
));

const App: React.FC = () => {
  // Default Initial State
  const [user, setUser] = useState<UserState>({
        balance: 0,
        username: 'Guest',
        isLoggedIn: false,
        level: 0,
        xp: 0,
        claimedLevels: [],
        usernameChanged: false,
        totalWagered: 0,
        affiliateEarnings: 0,
        totalReferred: 0
  });

  const [currentPath, setCurrentPath] = useState(() => {
      try {
          if (window.location.protocol === 'blob:' || window.location.protocol === 'file:') return '/';
          const path = window.location.pathname;
          if (path.endsWith('/leaderboard')) return '/leaderboard';
          if (path.endsWith('/crash')) return '/crash';
          if (path.endsWith('/coinflip')) return '/coinflip';
          if (path.endsWith('/mines')) return '/mines';
          if (path.endsWith('/blackjack')) return '/blackjack';
          if (path.endsWith('/cases')) return '/cases';
          if (path.endsWith('/case-battles')) return '/case-battles';
          return '/';
      } catch (e) {
          return '/';
      }
  });
  
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAffiliatesModalOpen, setIsAffiliatesModalOpen] = useState(false);
  const [isTipRainModalOpen, setIsTipRainModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false); // New Admin State
  const [walletTab, setWalletTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [authMode, setAuthMode] = useState<AuthMode>('SIGNUP');
  
  const [viewedProfile, setViewedProfile] = useState<PublicProfile | null>(null);

  // Admin Detection
  const isAdmin = user.isLoggedIn && (user.username === 'Mixi' || user.username === 'Pinky');

  useEffect(() => {
    if (window.location.protocol === 'blob:' || window.location.protocol === 'file:') return;
    const handlePopState = () => {
        const path = window.location.pathname;
        if (path.endsWith('/leaderboard')) setCurrentPath('/leaderboard');
        else if (path.endsWith('/crash')) setCurrentPath('/crash');
        else if (path.endsWith('/coinflip')) setCurrentPath('/coinflip');
        else if (path.endsWith('/mines')) setCurrentPath('/mines');
        else if (path.endsWith('/blackjack')) setCurrentPath('/blackjack');
        else if (path.endsWith('/cases')) setCurrentPath('/cases');
        else if (path.endsWith('/case-battles')) setCurrentPath('/case-battles');
        else setCurrentPath('/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
      setCurrentPath(path);
      try {
          if (window.location.protocol === 'file:' || window.location.protocol === 'blob:') return;
          window.history.pushState({}, '', path);
      } catch (e) {}
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) fetchUserProfile(session.user.id, session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            fetchUserProfile(session.user.id, session.user.email);
            setIsAuthModalOpen(false);
        } else {
            setUser({
                balance: 0,
                username: 'Guest',
                isLoggedIn: false,
                level: 0,
                xp: 0,
                claimedLevels: [],
                usernameChanged: false,
                totalWagered: 0,
                affiliateEarnings: 0,
                totalReferred: 0
            });
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime Profile Sync
  useEffect(() => {
    if (!user.isLoggedIn || !user.id) return;

    const channel = supabase
      .channel(`public:profiles:id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newProfile = payload.new as any;
          if (newProfile) {
              setUser((prev) => ({
                ...prev,
                balance: Number(newProfile.balance),
                xp: Number(newProfile.xp),
                level: newProfile.level,
                totalWagered: Number(newProfile.total_wagered),
                affiliateEarnings: Number(newProfile.affiliate_earnings),
                totalReferred: newProfile.total_referred,
              }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.isLoggedIn, user.id]);

  const fetchUserProfile = async (userId: string, email?: string) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (error || !data) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: userId, username: 'User', balance: 0, level: 0, xp: 0 }])
            .select().single();

          if (newProfile) {
              setUser({
                id: userId,
                username: newProfile.username || 'User',
                email: email,
                balance: Number(newProfile.balance) || 0,
                level: newProfile.level || 0,
                xp: Number(newProfile.xp) || 0,
                avatar: newProfile.avatar || undefined,
                claimedLevels: newProfile.claimed_levels || [],
                usernameChanged: newProfile.username_changed || false,
                totalWagered: Number(newProfile.total_wagered) || 0,
                referralCode: newProfile.referral_code,
                affiliateEarnings: Number(newProfile.affiliate_earnings) || 0,
                totalReferred: newProfile.total_referred || 0,
                isLoggedIn: true
              });
              return;
          }
      }
      
      if (data) {
          setUser({
              id: userId,
              username: data.username || 'User',
              email: email,
              balance: Number(data.balance) || 0,
              level: data.level || 0,
              xp: Number(data.xp) || 0,
              avatar: data.avatar || undefined,
              claimedLevels: data.claimed_levels || [],
              usernameChanged: data.username_changed || false,
              totalWagered: Number(data.total_wagered) || 0,
              referralCode: data.referral_code,
              affiliateEarnings: Number(data.affiliate_earnings) || 0,
              totalReferred: data.total_referred || 0,
              isLoggedIn: true
          });
      }
  };

  const updateBalance = (amount: number) => {
      if (!user.isLoggedIn) return;
      
      setUser(prev => {
          const newBalance = prev.balance + amount;
          
          if (prev.id) {
             supabase.from('profiles').update({ balance: newBalance }).eq('id', prev.id).then(({ error }) => {
                 if (error) console.error("Balance update failed:", error);
             });
          }

          return { ...prev, balance: newBalance };
      });
  };

  const handleGamePlay = async (wagerAmount: number) => {
      if (!user.isLoggedIn) return;
      const xpGain = Math.floor(wagerAmount); 
      const newXp = (user.xp || 0) + xpGain;
      const currentWagered = user.totalWagered || 0;
      const newTotalWagered = currentWagered + wagerAmount;
      let newLevel = user.level || 0;
      for (const tier of LEVEL_SYSTEM) {
          if (newXp >= tier.xpRequired && tier.level > newLevel) {
              newLevel = tier.level;
          }
      }
      setUser(p => ({ 
          ...p, xp: newXp, level: newLevel, totalWagered: newTotalWagered
      }));
      
      if (user.id) {
           await supabase.from('profiles').update({ xp: newXp, level: newLevel, total_wagered: newTotalWagered }).eq('id', user.id);
      }
  };

  const handleLogout = async () => { 
      await supabase.auth.signOut();
      setUser({ balance: 0, username: 'Guest', isLoggedIn: false, level: 0, xp: 0, claimedLevels: [], usernameChanged: false, totalWagered: 0 }); 
      navigate('/'); 
  };

  const handleUpdateProfile = (updates: Partial<UserState>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleClaimReward = async (level: number, reward: number) => {
    if (!user.isLoggedIn || user.claimedLevels.includes(level)) return;
    if (user.level < level) return; 
    const newBalance = user.balance + reward;
    const newClaimed = [...user.claimedLevels, level];
    setUser(prev => ({ ...prev, balance: newBalance, claimedLevels: newClaimed }));
    
    if (user.id) {
        await supabase.from('profiles').update({ balance: newBalance, claimed_levels: newClaimed }).eq('id', user.id);
    }
  };

  // Robust Affiliate Claim with Fallback
  const handleClaimAffiliate = async () => {
      if (!user.isLoggedIn || !user.affiliateEarnings || user.affiliateEarnings <= 0) return;
      
      const amount = user.affiliateEarnings;
      
      // 1. Optimistic Update
      setUser(prev => ({
          ...prev,
          balance: prev.balance + amount,
          affiliateEarnings: 0
      }));

      // 2. Try RPC (Ideal path)
      const { error } = await supabase.rpc('claim_affiliate_earnings');
      
      // 3. Fallback: Manual update if RPC fails
      if (error) {
          console.warn("Affiliate RPC failed, falling back to direct update...", error);
          if (user.id) {
              await supabase.from('profiles').update({ 
                  balance: user.balance + amount,
                  affiliate_earnings: 0 
              }).eq('id', user.id);
          }
      }
  };

  const handleOpenLogin = () => { setAuthMode('LOGIN'); setIsAuthModalOpen(true); };
  const handleOpenSignup = () => { setAuthMode('SIGNUP'); setIsAuthModalOpen(true); };
  const handleOpenWallet = (tab: 'DEPOSIT' | 'WITHDRAW') => {
      if (!user.isLoggedIn) { handleOpenLogin(); return; }
      setWalletTab(tab); setIsWalletModalOpen(true);
  };
  const handleOpenAffiliates = () => {
      if (!user.isLoggedIn) { handleOpenLogin(); return; }
      setIsAffiliatesModalOpen(true);
  };
  const handleOpenTipRain = () => {
      if (!user.isLoggedIn) { handleOpenLogin(); return; }
      setIsTipRainModalOpen(true);
  }

  const handleViewUser = async (userId: string) => {
      if (!userId) return;
      const { data } = await supabase.from('profiles').select('id, username, avatar, level, total_wagered, updated_at').eq('id', userId).single();
      if (data) {
          setViewedProfile({
              id: data.id, username: data.username, avatar: data.avatar, level: data.level, totalWagered: data.total_wagered, createdAt: data.updated_at
          });
      }
  };

  const handleSendTip = async (amount: number) => {
      if (!viewedProfile || !user.isLoggedIn) return;
      const { error } = await supabase.rpc('transfer_mooncoins', { receiver_id: viewedProfile.id, amount: amount });
      if (error) throw error;
      updateBalance(-amount);
  };

  const handleSendRain = async (amount: number) => {
      if (!user.isLoggedIn) return;
      updateBalance(-amount);

      try {
        const { error: rainError } = await supabase.rpc('add_to_rain', { added_amount: amount });
        if (rainError) {
             console.warn("RPC add_to_rain failed. Attempting direct table update...", rainError);
            const { data: currentPool, error: fetchError } = await supabase.from('rain_pool').select('id, amount').single();
            if (!fetchError && currentPool) {
                await supabase.from('rain_pool').update({ amount: Number(currentPool.amount) + amount }).eq('id', currentPool.id);
            } else if (fetchError && (fetchError.code === 'PGRST116' || fetchError.message.includes('JSON'))) {
                await supabase.from('rain_pool').insert({ amount: amount, ends_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
            }
        }
      } catch (err: any) {}

      try {
          await supabase.from('messages').insert({
              user_id: user.id, // Use ID from state
              username: 'MoonBlox Rain', 
              text: `${user.username} added ${amount.toLocaleString()} M to the Rain Pool! 🌧️💸`, 
              rank: 'SYSTEM', 
              avatar: ''
          });
      } catch (e) {}
  };

  const Home = () => (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto animate-fade-in pb-24 relative z-10">
          
          {/* Hero / Promo Banner */}
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 mb-12 shadow-2xl min-h-[340px] flex items-center border border-white/5 group hover:border-white/10 transition-colors">
               <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/devlfz6tf/image/upload/v1764978237/b902a774-3fdb-4f5e-979e-74edc33d7f6e.png')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-transparent"></div>
               
               <div className="relative z-10 p-10 md:p-16 max-w-2xl">
                   <div className="flex items-center gap-3 mb-6">
                       <span className="bg-blox-accent/10 text-blox-accent border border-blox-accent/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">100% Deposit Match</span>
                   </div>
                   <h1 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-6 drop-shadow-2xl">
                       THE ULTIMATE <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blox-accent to-yellow-300">BLOX CASINO</span>
                   </h1>
                   <div className="flex gap-4">
                       {!user.isLoggedIn && (
                           <button onClick={handleOpenSignup} className="bg-blox-accent hover:bg-white hover:text-black text-black font-black text-sm px-10 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1">
                               START WINNING
                           </button>
                       )}
                       <button onClick={() => navigate('/leaderboard')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all backdrop-blur-md hover:border-white/20">
                           VIEW LEADERBOARD
                       </button>
                   </div>
               </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <Rocket className="text-blox-accent" size={24} />
                  Original Games
              </h2>
          </div>

          {/* Games Grid - Components are memoized to avoid re-rendering entire list on balance change */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
               <GameCardSmall 
                    title="Case Battles" 
                    icon={Sword} 
                    isNew
                    coverImage={COVER_IMAGES.CASE_BATTLES}
                    onClick={() => navigate('/case-battles')} 
               />
               <GameCardSmall 
                    title="Cases" 
                    icon={Box} 
                    coverImage={COVER_IMAGES.CASES}
                    onClick={() => navigate('/cases')} 
               />
               <GameCardSmall 
                    title="Crash" 
                    icon={Rocket} 
                    coverImage={COVER_IMAGES.CRASH}
                    onClick={() => navigate('/crash')} 
               />
               <GameCardSmall 
                    title="Blackjack" 
                    icon={LayoutGrid} 
                    coverImage={COVER_IMAGES.BLACKJACK}
                    onClick={() => navigate('/blackjack')} 
               />
               <GameCardSmall 
                    title="Coinflip" 
                    icon={Coins} 
                    coverImage={COVER_IMAGES.COINFLIP}
                    onClick={() => navigate('/coinflip')} 
               />
               <GameCardSmall 
                    title="Mines" 
                    icon={Bomb} 
                    coverImage={COVER_IMAGES.MINES}
                    onClick={() => navigate('/mines')} 
               />
          </div>
      </div>
  );

  const renderContent = () => {
      switch (currentPath) {
          case '/leaderboard': return <Leaderboard user={user} onGoHome={() => navigate('/')} />;
          case '/crash':
              return (
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                        <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                    </button>
                    <Crash balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/coinflip':
              return (
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                        <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                    </button>
                    <CoinFlip balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/mines':
              return (
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                        <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                    </button>
                    <Mines balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/blackjack':
              return (
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                        <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                    </button>
                    <Blackjack balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/cases':
              return (
                <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
                    <button onClick={() => navigate('/')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                        <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                    </button>
                    <Cases balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/case-battles':
              return (
                <div className="p-0">
                    <button onClick={() => navigate('/')} className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10 lg:hidden">
                        <ChevronRight className="rotate-180" size={16}/> Back
                    </button>
                    <div className="hidden lg:block absolute top-8 left-8 z-20">
                        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors bg-[#151921] px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                            <ChevronRight className="rotate-180" size={16}/> Back to Lobby
                        </button>
                    </div>
                    <CaseBattles balance={user.balance} updateBalance={updateBalance} onPlay={handleGamePlay} isLoggedIn={user.isLoggedIn} onOpenLogin={handleOpenLogin} />
                </div>
              );
          case '/':
          default:
              return <Home />;
      }
  };

  return (
    <div className="flex h-screen bg-[#0B0E14] text-blox-text font-sans overflow-hidden bg-noise selection:bg-blox-accent selection:text-black">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-40"></div>

        {isChatOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-md" onClick={() => setIsChatOpen(false)}></div>}

        <div className={`fixed inset-y-0 left-0 z-50 h-full bg-[#151921]/95 border-r border-white/5 lg:relative lg:block transition-all duration-300 ease-in-out transform shadow-2xl backdrop-blur-xl ${isChatOpen ? 'translate-x-0 w-[320px]' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}`}>
             <Chat 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                username={user.username} 
                avatar={user.avatar} 
                isLoggedIn={user.isLoggedIn} 
                onOpenLogin={handleOpenLogin} 
                onUserClick={handleViewUser} 
                onOpenTipRain={handleOpenTipRain}
                isAdmin={isAdmin}
             />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
             <Navbar user={user} onLogout={handleLogout} onOpenLogin={handleOpenLogin} onOpenSignup={handleOpenSignup} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenProfile={() => setIsProfileModalOpen(true)} onOpenWallet={handleOpenWallet} onOpenAffiliates={handleOpenAffiliates} currentPath={currentPath} navigate={navigate} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
             
             <main className="flex-1 overflow-y-auto relative scrollbar-hide">
                  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                  </div>
                  
                  <div className="relative z-10 pb-10 min-h-full">
                    {renderContent()}
                  </div>
             </main>
        </div>
        
        {/* Admin Floating Button */}
        {isAdmin && (
            <button 
                onClick={() => setIsAdminPanelOpen(true)}
                className="fixed bottom-6 right-6 z-[60] bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform hover:scale-110 flex items-center justify-center"
            >
                <ShieldAlert size={24} />
            </button>
        )}

        {isAuthModalOpen && <AuthModal onLogin={() => {}} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />}
        {isSettingsModalOpen && user.isLoggedIn && <SettingsModal user={user} onUpdate={handleUpdateProfile} onClose={() => setIsSettingsModalOpen(false)} />}
        {isProfileModalOpen && user.isLoggedIn && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onClaimReward={handleClaimReward} />}
        {isWalletModalOpen && user.isLoggedIn && <WalletModal user={user} onClose={() => setIsWalletModalOpen(false)} onDeposit={(amount) => updateBalance(amount)} onWithdraw={(amount) => updateBalance(-amount)} initialTab={walletTab} />}
        {viewedProfile && <UserStatsModal profile={viewedProfile} currentUser={user} onClose={() => setViewedProfile(null)} onTip={handleSendTip} />}
        {isAffiliatesModalOpen && user.isLoggedIn && <AffiliatesModal user={user} onClose={() => setIsAffiliatesModalOpen(false)} onClaim={handleClaimAffiliate} onUpdate={handleUpdateProfile} />}
        {isTipRainModalOpen && user.isLoggedIn && <TipRainModal user={user} onClose={() => setIsTipRainModalOpen(false)} onSendRain={handleSendRain} />}
        {isAdminPanelOpen && isAdmin && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
    </div>
  );
};

export default App;
