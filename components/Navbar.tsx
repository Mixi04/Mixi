import React, { useState } from 'react';
import { User, Bell, ChevronDown, Gamepad2, Gift, Home as HomeIcon, LogOut, Wallet, Settings, Trophy, MessageSquare, Menu, Moon, ArrowUpCircle } from 'lucide-react';
import { UserState } from '../types';

interface NavbarProps {
  user: UserState;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenWallet: (tab: 'DEPOSIT' | 'WITHDRAW') => void;
  onOpenAffiliates: () => void;
  currentPath: string;
  navigate: (path: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenLogin, onOpenSignup, onOpenSettings, onOpenProfile, onOpenWallet, onOpenAffiliates, navigate, isChatOpen, setIsChatOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="flex flex-col w-full z-40">
      {/* Navbar Main */}
      <nav className="h-[76px] bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:px-8 shadow-sm relative z-20">
        
        {/* Left Side (Logo & Nav) */}
        <div className="flex items-center gap-6">
            {/* Chat Toggle */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${isChatOpen ? 'bg-blox-surfaceHighlight text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Toggle Global Chat"
            >
              <MessageSquare size={18} className={isChatOpen ? "fill-white" : ""} />
            </button>

            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1 hover:opacity-90 transition-opacity">
                <span className="font-extrabold text-2xl tracking-tighter">Moon</span>
                <span className="text-blox-accent font-extrabold text-2xl tracking-tighter drop-shadow-lg">Blox</span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>

            {/* Main Nav Buttons */}
            <div className="hidden lg:flex items-center gap-1">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                    <HomeIcon size={16} />
                    Home
                </button>
                
                <button 
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                    <Gamepad2 size={16} />
                    Games
                    <ChevronDown size={14} className="opacity-50" />
                </button>

                 <button 
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all opacity-60 cursor-not-allowed"
                >
                    <Gift size={16} />
                    Rewards
                </button>
            </div>
        </div>

        {/* Right Side (Auth/Profile) */}
        <div className="flex items-center gap-3 lg:gap-5">
          {user.isLoggedIn ? (
            <>
               {/* Balance Display */}
              <div 
                className="hidden sm:flex items-center gap-4 bg-[#151921]/50 backdrop-blur-md border border-white/5 rounded-xl px-2 py-2 pr-5 hover:border-white/10 transition-all cursor-pointer group hover:bg-[#151921]"
                onClick={() => onOpenWallet('DEPOSIT')}
              >
                <div className="h-9 px-3.5 rounded-lg bg-blox-accent/10 border border-blox-accent/20 flex items-center justify-center text-blox-accent group-hover:bg-blox-accent/20 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                     <Moon size={16} fill="currentColor" />
                </div>
                <div className="flex flex-col items-start leading-none -space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Balance</span>
                    <span className="font-mono font-bold text-white text-base">{user.balance.toLocaleString()}</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blox-accent flex items-center justify-center text-black shadow-lg shadow-yellow-500/10 ml-2 group-hover:scale-105 transition-transform">
                    <span className="font-bold text-lg leading-none mb-0.5">+</span>
                </div>
              </div>

               {/* Profile */}
              <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-xl transition-all border border-transparent hover:border-white/5"
                  >
                    <img 
                        src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-xl bg-[#151921] object-cover ring-2 ring-white/5 group-hover:ring-white/10 shadow-lg" 
                    />
                    <div className="hidden md:flex flex-col items-start -space-y-1">
                        <span className="text-sm font-bold text-white max-w-[100px] truncate">{user.username}</span>
                        <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                             <span className="text-[10px] text-gray-400 font-bold">Lvl {user.level || 0}</span>
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-gray-500 hidden md:block" />
                  </button>
                  
                  {showProfileMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                        <div className="absolute top-full right-0 mt-3 w-72 bg-[#151921] border border-white/10 rounded-2xl shadow-2xl p-2 animate-scale-in z-50 ring-1 ring-black/50 backdrop-blur-xl">
                            {/* Level Progress Widget */}
                            <button 
                              onClick={() => {
                                  onOpenProfile();
                                  setShowProfileMenu(false);
                              }}
                              className="w-full bg-[#0B0E14] border border-white/5 rounded-xl p-4 mb-2 relative overflow-hidden group hover:border-white/10 transition-colors"
                            >
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-gray-400">Level Progress</span>
                                   <span className="text-xs font-bold text-white">{user.level} <span className="text-gray-600">/</span> {user.level + 1}</span>
                               </div>
                               <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-gradient-to-r from-blox-accent to-yellow-300 w-[45%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                               </div>
                               <div className="mt-2 flex items-center gap-1 text-[10px] text-blox-accent font-bold group-hover:text-white transition-colors">
                                   <Trophy size={10} />
                                   <span>View Rewards</span>
                               </div>
                            </button>

                            <div className="space-y-1">
                                <button 
                                  onClick={() => {
                                      onOpenWallet('DEPOSIT');
                                      setShowProfileMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Wallet className="w-4 h-4 text-gray-500" />
                                    Wallet
                                </button>
                                <button 
                                  onClick={() => {
                                      onOpenSettings();
                                      setShowProfileMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    Settings
                                </button>
                                <button 
                                  onClick={() => {
                                      onOpenAffiliates();
                                      setShowProfileMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Gift className="w-4 h-4 text-gray-500" />
                                    Affiliates
                                </button>
                            </div>

                            <div className="h-px bg-white/5 my-2" />
                            
                            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                      </>
                  )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
               <button 
                onClick={onOpenLogin}
                className="hidden md:block text-gray-300 font-bold text-sm hover:text-white px-5 py-2.5 transition-colors"
               >
                 Log In
               </button>
               <button 
                onClick={onOpenSignup}
                className="bg-blox-accent hover:bg-blox-accentHover text-[#0B0E14] font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all"
               >
                 Register
               </button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Secondary Nav Bar (Sub-navigation) */}
      <div className="h-11 bg-[#0B0E14] border-b border-white/5 flex items-center justify-center relative z-10 shadow-sm">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide px-6 max-w-full">
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors whitespace-nowrap">Fairness</a>
              <button onClick={onOpenAffiliates} className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors whitespace-nowrap">Affiliates</button>
              <button onClick={() => navigate('/leaderboard')} className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 group">
                 <Trophy size={12} className="text-blox-accent group-hover:scale-110 transition-transform" /> Leaderboard
              </button>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors whitespace-nowrap">VIP Club</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors whitespace-nowrap">Support</a>
          </div>
      </div>
    </div>
  );
};

export default Navbar;