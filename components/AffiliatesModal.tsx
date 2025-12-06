
import React, { useState } from 'react';
import { UserState } from '../types';
import { supabase } from '../supabaseClient';
import { X, Copy, Check, Moon, Download, ChevronLeft, ChevronRight, User, Tag, Link as LinkIcon, Save, Edit2, AlertCircle, RefreshCw } from 'lucide-react';

interface AffiliatesModalProps {
  user: UserState;
  onClose: () => void;
  onClaim: () => void; // This callback in App.tsx handles the actual logic/fallback
  onUpdate: (updates: Partial<UserState>) => void;
}

// Mock data to populate the table visually matches the screenshot
const MOCK_REFERRALS = [
    { username: 'lucky_winner', avatar: '', date: '11/30/2025', wagered: 77408, commission: 596, lastSeen: '12/4/2025' },
    { username: 'moon_whale', avatar: '', date: '12/01/2025', wagered: 1000, commission: 6, lastSeen: '12/1/2025' },
    { username: 'crypto_king', avatar: '', date: '12/02/2025', wagered: 25000, commission: 120, lastSeen: 'Today' },
];

const AffiliatesModal: React.FC<AffiliatesModalProps> = ({ user, onClose, onClaim, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Editing Code State
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newCode, setNewCode] = useState(user.referralCode || '');
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://moonblox.vercel.app';
  // Updated Link Format: domain/?ref=CODE
  const referralLink = `${origin}/?ref=${user.referralCode || 'Mixi'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setSuccessMsg('Referral link copied!');
    setTimeout(() => {
        setCopied(false);
        setSuccessMsg(null);
    }, 2000);
  };

  const handleClaimClick = async () => {
    if (!user.affiliateEarnings || user.affiliateEarnings <= 0) return;
    
    setIsClaiming(true);
    // Simulate API delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
        await onClaim(); // Call the robust handler in App.tsx
        setSuccessMsg('Earnings claimed successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
        console.error(e);
        setError('Failed to claim. Try again.');
    } finally {
        setIsClaiming(false);
    }
  };

  const handleSaveCode = async () => {
      const code = newCode.trim();
      if (!code) { setError("Code cannot be empty"); return; }
      if (code.length < 3) { setError("Code must be at least 3 characters"); return; }
      if (!/^[a-zA-Z0-9]+$/.test(code)) { setError("Alphanumeric only"); return; }

      setIsSavingCode(true);
      setError(null);

      try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) return;

          const { error } = await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', authUser.id);
          
          if (error) {
              if (error.code === '23505') throw new Error('This code is already taken');
              throw error;
          }

          onUpdate({ referralCode: code });
          setIsEditingCode(false);
          setSuccessMsg('Referral code updated!');
          setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
          setError(err.message || "Failed to update code");
      } finally {
          setIsSavingCode(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#020617] border border-[#1E293B] rounded-3xl overflow-hidden animate-slide-up shadow-2xl flex flex-col lg:flex-row">
        
        {/* Toast Notification */}
        {successMsg && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-2 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-slide-up flex items-center gap-2">
                <Check size={16} /> {successMsg}
            </div>
        )}

        <button 
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-white bg-[#0F172A] rounded-full z-50"
        >
            <X className="w-5 h-5" />
        </button>

        {/* --- LEFT SIDEBAR --- */}
        <div className="w-full lg:w-[320px] bg-[#0F172A] border-r border-[#1E293B] p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
            
            <div className="flex items-center gap-2 text-white font-black italic text-xl mb-2">
                <span className="text-blox-accent">Your Referral Code</span>
            </div>

            {/* Code Input */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Your affiliate code</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blox-accent">
                        <Tag size={16} />
                    </div>
                    <input 
                        value={isEditingCode ? newCode : (user.referralCode || '...')}
                        onChange={(e) => setNewCode(e.target.value)}
                        readOnly={!isEditingCode}
                        className={`w-full bg-[#020617] border border-[#1E293B] text-white font-black rounded-xl py-4 pl-12 pr-20 outline-none transition-all shadow-inner ${isEditingCode ? 'border-blox-accent/50 focus:border-blox-accent' : ''}`}
                    />
                    
                    {isEditingCode ? (
                         <button 
                            onClick={handleSaveCode}
                            disabled={isSavingCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors text-xs font-bold px-3 border border-white/5 flex items-center gap-1"
                         >
                            {isSavingCode ? '...' : <><Save size={12}/> Save</>}
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setNewCode(user.referralCode || '');
                                setIsEditingCode(true);
                                setError(null);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1E293B] hover:bg-[#334155] text-white p-2 rounded-lg transition-colors text-xs font-bold px-3 border border-white/5 flex items-center gap-1"
                        >
                           <Edit2 size={12}/> Edit
                        </button>
                    )}
                </div>
                {error && (
                    <div className="text-red-400 text-[10px] font-bold flex items-center gap-1 animate-shake">
                        <AlertCircle size={10} /> {error}
                    </div>
                )}
            </div>

            {/* Link Input */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Your referral link</label>
                <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                        <LinkIcon size={16} />
                    </div>
                    <input 
                        readOnly
                        value={referralLink}
                        className="w-full bg-[#020617] border border-[#1E293B] text-emerald-400 font-mono font-bold text-xs rounded-xl py-4 pl-12 pr-12 outline-none truncate focus:border-emerald-500/50 transition-all shadow-inner"
                    />
                    <button 
                        onClick={handleCopy}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors bg-[#020617] p-1.5 rounded-lg border border-white/5"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Sponsorship Banner */}
            <a 
                href="#"
                onClick={(e) => e.preventDefault()}
                className="relative rounded-xl overflow-hidden h-24 bg-gradient-to-r from-emerald-900 to-emerald-950 border border-emerald-500/20 flex items-center px-6 cursor-pointer hover:opacity-90 transition-opacity block group"
            >
                <div className="relative z-10">
                    <div className="text-white font-black italic text-lg leading-tight group-hover:translate-x-1 transition-transform">WANT A SPONSORSHIP?</div>
                    <div className="text-emerald-400 font-bold text-xs uppercase">APPLY HERE</div>
                </div>
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500 rounded-full blur-[40px] opacity-20"></div>
            </a>
            
            <div className="mt-auto pt-4 border-t border-[#1E293B] text-center">
                 <p className="text-[10px] text-gray-500 font-medium">
                     Share your code with friends. You earn <span className="text-white font-bold">5%</span> of house edge on every bet they place!
                 </p>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 bg-[#020617] flex flex-col min-h-0">
            
            {/* Header Area */}
            <div className="p-8 border-b border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white">Your Statistics & Earnings</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">Real-time updates on your referral performance.</p>
                </div>

                {/* Claim Widget */}
                <div className="flex items-center bg-[#0F172A] rounded-xl border border-[#1E293B] p-2 shadow-lg">
                    <div className="px-4 border-r border-[#1E293B] mr-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Available Earnings:</div>
                        <div className="text-emerald-400 font-mono font-bold text-lg flex items-center gap-1">
                            <Moon size={14} fill="currentColor" />
                            {user.affiliateEarnings?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <button 
                        onClick={handleClaimClick}
                        disabled={!user.affiliateEarnings || user.affiliateEarnings <= 0 || isClaiming}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#1E293B] disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black text-sm px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
                    >
                        {isClaiming ? <RefreshCw size={14} className="animate-spin" /> : 'CLAIM'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                
                {/* Close Button Desktop */}
                <button 
                    onClick={onClose}
                    className="hidden lg:block absolute top-6 right-6 p-2 text-gray-500 hover:text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-full transition-colors border border-white/5"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 text-center relative overflow-hidden group hover:border-blox-accent/30 transition-colors">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">DEPOSITED</div>
                        <div className="text-white font-mono font-bold text-xl flex items-center justify-center gap-1">
                             <Moon size={16} className="text-blox-accent" fill="currentColor" />
                             0.00
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 text-center hover:border-blox-accent/30 transition-colors">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">WAGERED</div>
                        <div className="text-white font-mono font-bold text-xl flex items-center justify-center gap-1">
                             <Moon size={16} className="text-blox-accent" fill="currentColor" />
                             0.00
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 text-center hover:border-blox-accent/30 transition-colors">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">REFERRED</div>
                        <div className="text-white font-mono font-bold text-xl flex items-center justify-center gap-1">
                             <User size={16} className="text-blue-500" />
                             {user.totalReferred || 0}
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 text-center hover:border-blox-accent/30 transition-colors">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">TOTAL EARNINGS</div>
                        <div className="text-emerald-400 font-mono font-bold text-xl flex items-center justify-center gap-1">
                             <Moon size={16} fill="currentColor" />
                             {user.affiliateEarnings?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl overflow-hidden min-h-[300px] flex flex-col shadow-xl">
                    <div className="p-6 border-b border-[#1E293B]">
                        <h3 className="text-lg font-bold text-gray-300">User Statistics</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0B101E] text-xs font-black text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Affiliated User</th>
                                    <th className="px-6 py-4">Date Referred</th>
                                    <th className="px-6 py-4">Total Wagered</th>
                                    <th className="px-6 py-4">Commission</th>
                                    <th className="px-6 py-4 text-right">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1E293B]">
                                {user.totalReferred === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-50">
                                                <User size={32} className="mb-2" />
                                                <span className="text-sm font-bold text-gray-400">No referrals yet. Share your code to get started!</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {/* Mock Data Display if no real data */}
                                {user.totalReferred > 0 && MOCK_REFERRALS.map((referral, index) => (
                                    <tr key={index} className="hover:bg-[#162032] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                                <span className="font-bold text-white text-sm group-hover:text-blox-accent transition-colors">{referral.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-400">
                                            {referral.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-mono font-bold text-white text-sm">
                                                <Moon size={12} className="text-gray-500" fill="currentColor" />
                                                {referral.wagered.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-sm">
                                                <Moon size={12} fill="currentColor" />
                                                {referral.commission.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                                            {referral.lastSeen}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="mt-auto p-4 border-t border-[#1E293B] flex items-center justify-between">
                         <button className="p-2 bg-[#1E293B] hover:bg-[#334155] rounded-lg text-white transition-colors disabled:opacity-50" disabled>
                            <ChevronLeft size={16} />
                         </button>
                         <div className="text-xs font-bold text-gray-500">Page 1 / 1</div>
                         <button className="p-2 bg-[#1E293B] hover:bg-[#334155] rounded-lg text-white transition-colors disabled:opacity-50" disabled>
                            <ChevronRight size={16} />
                         </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesModal;
