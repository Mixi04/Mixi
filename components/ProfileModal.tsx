
import React from 'react';
import { UserState } from '../types';
import { X, Trophy, Lock, Check, User, Star, Moon } from 'lucide-react';

interface ProfileModalProps {
  user: UserState;
  onClose: () => void;
  onClaimReward: (level: number, reward: number) => void;
}

const LEVEL_REWARDS = [
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

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onClaimReward }) => {
  
  // Calculate progress to next level
  // For simplicity, let's assume current level max XP is the next level's requirement
  const nextLevelData = LEVEL_REWARDS.find(l => l.level === user.level + 1) || LEVEL_REWARDS[LEVEL_REWARDS.length - 1];
  const progressPercent = Math.min(100, (user.xp / nextLevelData.xpRequired) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-2xl bg-[#151B25] border border-[#2A3441] rounded-3xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
        
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-blox-accent to-yellow-600 relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="absolute -bottom-10 left-8 flex items-end">
                <div className="relative">
                    <img 
                        src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-2xl bg-[#151B25] p-1 object-cover border-4 border-[#151B25]" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blox-accent text-black font-black text-xs px-2 py-1 rounded-lg border-2 border-[#151B25]">
                        LVL {user.level}
                    </div>
                </div>
            </div>
        </div>

        {/* User Info & Stats */}
        <div className="pt-12 px-8 pb-6 border-b border-[#2A3441]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-black text-white">{user.username}</h2>
                    <p className="text-gray-500 text-sm font-bold">Member since 2024</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-gray-500 uppercase">Total XP</div>
                    <div className="text-xl font-mono font-bold text-blox-accent">{user.xp.toLocaleString()} XP</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Level {user.level}</span>
                <span>Level {user.level + 1}</span>
            </div>
            <div className="h-4 bg-[#0B0E14] rounded-full overflow-hidden border border-[#2F2B3E] relative group">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-md">
                    {user.xp} / {nextLevelData.xpRequired} XP
                </div>
            </div>
        </div>

        {/* Rewards List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-4">
                <Trophy className="text-[#F59E0B]" size={20} />
                Level Rewards
            </h3>

            {LEVEL_REWARDS.map((item) => {
                const isClaimed = user.claimedLevels.includes(item.level);
                const isUnlocked = user.level >= item.level;
                const isNext = user.level + 1 === item.level;

                return (
                    <div key={item.level} className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-[#1C1A26] border-[#2A3441]' : 'bg-[#0B0E14] border-[#1C1A26] opacity-60'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg ${isUnlocked ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' : 'bg-[#2A2737] text-gray-600'}`}>
                                {item.level}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white uppercase">Level {item.level} Reward</div>
                                <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                                    <Moon size={10} fill="currentColor" />
                                    {item.reward.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {isClaimed ? (
                            <button disabled className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg font-bold text-xs flex items-center gap-2">
                                <Check size={14} /> CLAIMED
                            </button>
                        ) : isUnlocked ? (
                            <button 
                                onClick={() => onClaimReward(item.level, item.reward)}
                                className="px-6 py-2 bg-blox-accent hover:bg-blox-accentHover text-black rounded-lg font-black text-xs shadow-lg hover:shadow-yellow-500/20 transition-all animate-pulse-fast"
                            >
                                CLAIM
                            </button>
                        ) : (
                            <div className="px-4 py-2 bg-[#151B25] text-gray-500 border border-[#2A3441] rounded-lg font-bold text-xs flex items-center gap-2">
                                <Lock size={14} /> {item.xpRequired.toLocaleString()} XP
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
