
import React, { useState } from 'react';
import { PublicProfile, UserState } from '../types';
import { X, Moon, Trophy, Calendar, Send, ShieldCheck, AlertCircle } from 'lucide-react';

interface UserStatsModalProps {
  profile: PublicProfile;
  currentUser: UserState;
  onClose: () => void;
  onTip: (amount: number) => Promise<void>;
}

const UserStatsModal: React.FC<UserStatsModalProps> = ({ profile, currentUser, onClose, onTip }) => {
  const [tipAmount, setTipAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.isLoggedIn) return;
    
    const amount = parseInt(tipAmount);
    if (!amount || amount <= 0) {
        setError("Invalid amount");
        return;
    }
    if (amount > currentUser.balance) {
        setError("Insufficient balance");
        return;
    }

    setIsSending(true);
    setError(null);

    try {
        await onTip(amount);
        setSuccess(true);
        setTipAmount('');
        setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
        setError(err.message || 'Failed to send tip');
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm bg-[#151B25] border border-[#2A3441] rounded-3xl overflow-hidden animate-scale-in shadow-2xl">
        
        {/* Header / Banner */}
        <div className="h-24 bg-gradient-to-br from-indigo-900 to-[#151B25] relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-6 relative -mt-12 mb-6 text-center">
            <div className="inline-block relative">
                <img 
                    src={profile.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.username}`} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-2xl bg-[#151B25] p-1 object-cover border-4 border-[#151B25] shadow-xl" 
                />
                <div className="absolute -bottom-2 -right-2 bg-blox-accent text-black font-black text-xs px-2 py-0.5 rounded-lg border-2 border-[#151B25]">
                    LVL {profile.level}
                </div>
            </div>
            <h2 className="text-2xl font-black text-white mt-3">{profile.username}</h2>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 mt-1">
                <Calendar size={12} />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-6 mb-6">
            <div className="bg-[#0B0E14] border border-[#2A3441] p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Wagered</div>
                <div className="text-blox-accent font-mono font-bold flex items-center justify-center gap-1">
                    <Moon size={12} fill="currentColor" />
                    {profile.totalWagered.toLocaleString()}
                </div>
            </div>
            <div className="bg-[#0B0E14] border border-[#2A3441] p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Rank</div>
                <div className="text-white font-bold flex items-center justify-center gap-1">
                    <Trophy size={12} className="text-yellow-500" />
                    User
                </div>
            </div>
        </div>

        {/* Tipping Section */}
        <div className="bg-[#0F1219] p-6 border-t border-[#2A3441]">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Send size={16} className="text-blox-accent" />
                Send Tip
            </h3>

            {currentUser.username === profile.username ? (
                <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-gray-500 font-medium italic">
                    You cannot tip yourself.
                </div>
            ) : currentUser.isLoggedIn ? (
                <form onSubmit={handleTip} className="space-y-3">
                    <div className="relative">
                        <Moon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blox-accent" fill="currentColor" />
                        <input 
                            type="number" 
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                            placeholder="Amount"
                            className="w-full bg-[#0B0E14] border border-[#2F2B3E] text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 transition-all font-mono font-bold text-sm"
                        />
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-shake">
                            <AlertCircle size={10} /> {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="text-green-500 text-[10px] font-bold flex items-center gap-1 animate-scale-in">
                            <ShieldCheck size={10} /> Tip sent successfully!
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isSending}
                        className="w-full bg-blox-accent hover:bg-blox-accentHover text-black font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2"
                    >
                        {isSending ? 'SENDING...' : 'SEND MOONCOINS'}
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-gray-500 font-medium">
                    Log in to send tips to this player.
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default UserStatsModal;
