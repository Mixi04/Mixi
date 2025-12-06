
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Search, DollarSign, Lock, Unlock, Trash2, RefreshCw, AlertTriangle, CheckCircle, X, User } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'CHAT' | 'SYSTEM'>('USERS');
  
  // User Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  // System State
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemMsg, setSystemMsg] = useState('');

  const handleSearchUser = async () => {
      if (!searchQuery) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', searchQuery)
        .single();
      
      if (data) {
          setFoundUser(data);
          setAmount(data.balance.toString());
          setUserMsg('');
      } else {
          setFoundUser(null);
          setUserMsg('User not found');
      }
  };

  const handleSetBalance = async () => {
      if (!foundUser || !amount) return;
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ balance: parseFloat(amount) })
        .eq('id', foundUser.id);
        
      if (!error) {
          setFoundUser({ ...foundUser, balance: parseFloat(amount) });
          setUserMsg('Balance updated successfully');
      } else {
          setUserMsg('Failed to update balance');
      }
      setIsUpdating(false);
  };

  // Chat Commands
  const handleClearChat = async () => {
      if(!confirm("Are you sure you want to delete ALL messages?")) return;
      setIsProcessing(true);
      // Delete all rows in messages table
      const { error } = await supabase.from('messages').delete().neq('id', 0); // Delete all where ID is not 0 (all)
      
      if (!error) {
          setSystemMsg('Chat cleared successfully');
      } else {
          setSystemMsg('Failed to clear chat');
      }
      setIsProcessing(false);
  };

  const handleToggleMute = async (mute: boolean) => {
      setIsProcessing(true);
      const channel = supabase.channel('admin-commands');
      await channel.send({
          type: 'broadcast',
          event: mute ? 'LOCK_CHAT' : 'UNLOCK_CHAT',
          payload: { message: mute ? 'Global chat has been muted by an admin.' : 'Global chat has been unmuted.' }
      });
      setSystemMsg(mute ? 'Chat Locked Globally' : 'Chat Unlocked Globally');
      setIsProcessing(false);
      supabase.removeChannel(channel);
  };

  // Leaderboard Reset
  const handleResetLeaderboard = async () => {
      if (!confirm("DANGER: This will reset TOTAL WAGERED for EVERYONE to 0. Continue?")) return;
      
      setIsProcessing(true);
      // NOTE: RLS must allow this, or the user must be a service role. 
      // Assuming 'Mixi'/'Pinky' have RLS bypass or policy setup.
      // Since we are client-side, we try to update all profiles.
      
      // Fetch all IDs first (batching if needed, but simple for now)
      const { data: users } = await supabase.from('profiles').select('id');
      
      if (users) {
          // This might be slow if many users, ideally done via RPC function
          for (const u of users) {
             await supabase.from('profiles').update({ total_wagered: 0 }).eq('id', u.id);
          }
          setSystemMsg('Leaderboard reset complete');
      } else {
          setSystemMsg('Failed to fetch users');
      }
      setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative w-full max-w-4xl h-[600px] bg-[#0F1219] border border-red-900/50 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-16 bg-red-950/20 border-b border-red-900/30 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <Shield className="text-red-500" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Admin Control Panel</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-[#0B0E14] border-r border-white/5 p-4 flex flex-col gap-2">
                <button 
                    onClick={() => setActiveTab('USERS')}
                    className={`p-3 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-colors ${activeTab === 'USERS' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <User size={18} /> User Management
                </button>
                <button 
                    onClick={() => setActiveTab('CHAT')}
                    className={`p-3 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-colors ${activeTab === 'CHAT' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <Lock size={18} /> Chat Control
                </button>
                <button 
                    onClick={() => setActiveTab('SYSTEM')}
                    className={`p-3 rounded-xl font-bold text-sm text-left flex items-center gap-3 transition-colors ${activeTab === 'SYSTEM' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                >
                    <AlertTriangle size={18} /> System / Leaderboard
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#0F1219]">
                
                {/* --- USERS TAB --- */}
                {activeTab === 'USERS' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-[#151B25] p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Find User</h3>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Enter exact username..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 outline-none"
                                    />
                                </div>
                                <button onClick={handleSearchUser} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 rounded-xl transition-colors">
                                    Search
                                </button>
                            </div>
                            {userMsg && <div className="mt-3 text-sm font-bold text-yellow-500">{userMsg}</div>}
                        </div>

                        {foundUser && (
                            <div className="bg-[#151B25] p-6 rounded-2xl border border-red-500/30 animate-slide-up">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={foundUser.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${foundUser.username}`} className="w-16 h-16 rounded-xl bg-black" />
                                    <div>
                                        <div className="text-xl font-black text-white">{foundUser.username}</div>
                                        <div className="text-xs text-gray-400 font-mono">{foundUser.id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Current Balance</label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                                            <input 
                                                type="number" 
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <button 
                                            onClick={handleSetBalance}
                                            disabled={isUpdating}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUpdating ? <RefreshCw className="animate-spin" size={18}/> : 'Set Balance'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- CHAT TAB --- */}
                {activeTab === 'CHAT' && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-6">
                            <button 
                                onClick={() => handleToggleMute(true)}
                                disabled={isProcessing}
                                className="bg-[#151B25] border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                            >
                                <Lock size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
                                <div className="text-white font-bold">Lock Global Chat</div>
                                <div className="text-xs text-gray-500">Mutes everyone except admins</div>
                            </button>

                            <button 
                                onClick={() => handleToggleMute(false)}
                                disabled={isProcessing}
                                className="bg-[#151B25] border border-green-500/20 hover:border-green-500 hover:bg-green-500/10 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                            >
                                <Unlock size={32} className="text-green-500 group-hover:scale-110 transition-transform" />
                                <div className="text-white font-bold">Unlock Global Chat</div>
                                <div className="text-xs text-gray-500">Allows everyone to speak</div>
                            </button>
                        </div>

                        <button 
                            onClick={handleClearChat}
                            disabled={isProcessing}
                            className="w-full bg-[#151B25] border border-red-500/20 hover:bg-red-600 hover:border-red-500 p-6 rounded-2xl flex items-center justify-center gap-4 transition-all group"
                        >
                            <Trash2 size={24} className="text-red-500 group-hover:text-white" />
                            <div className="text-left">
                                <div className="text-red-500 font-bold group-hover:text-white">Clear Chat History</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/80">Permanently deletes all messages</div>
                            </div>
                        </button>
                        
                        {systemMsg && (
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center font-bold text-white flex items-center justify-center gap-2">
                                <CheckCircle size={16} className="text-green-500" /> {systemMsg}
                            </div>
                        )}
                     </div>
                )}

                {/* --- SYSTEM TAB --- */}
                {activeTab === 'SYSTEM' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                                <AlertTriangle /> DANGER ZONE
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">Actions here are irreversible.</p>
                            
                            <button 
                                onClick={handleResetLeaderboard}
                                disabled={isProcessing}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <RefreshCw className="animate-spin"/> : 'RESET LEADERBOARD (Set all Wagered to 0)'}
                            </button>
                        </div>
                        
                        {systemMsg && (
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center font-bold text-white flex items-center justify-center gap-2">
                                <CheckCircle size={16} className="text-green-500" /> {systemMsg}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
