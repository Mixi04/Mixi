
import React, { useState } from 'react';
import { UserState } from '../types';
import { X, CloudRain, Moon, ShieldCheck, AlertCircle } from 'lucide-react';

interface TipRainModalProps {
  user: UserState;
  onClose: () => void;
  onSendRain: (amount: number) => Promise<void>;
}

const TipRainModal: React.FC<TipRainModalProps> = ({ user, onClose, onSendRain }) => {
  const [amount, setAmount] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.isLoggedIn) return;

    const val = parseInt(amount);
    
    // Validation
    if (isNaN(val) || val < 10) {
        setError("Minimum rain amount is 10 Moon Coins");
        return;
    }
    if (val > user.balance) {
        setError("Insufficient balance");
        return;
    }

    setIsSending(true);
    setError(null);

    try {
        await onSendRain(val);
        setSuccess(true);
        setAmount('');
        setTimeout(() => {
            onClose();
        }, 1500);
    } catch (err: any) {
        setError(err.message || "Failed to send rain");
        setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-sm bg-[#151B25] border border-[#2A3441] rounded-3xl overflow-hidden animate-slide-up shadow-2xl">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-indigo-900 to-[#151B25] p-8 text-center border-b border-[#2A3441]">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <CloudRain size={32} className="text-indigo-400 animate-bounce-short" />
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tight">MAKE IT RAIN</h2>
            <p className="text-indigo-200/60 text-xs font-bold mt-1">Share the wealth with the chat!</p>
        </div>

        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Rain Amount</label>
                    <div className="relative">
                        <Moon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blox-accent" fill="currentColor" />
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError(null);
                            }}
                            placeholder="Min 10"
                            className="w-full bg-[#0B0E14] border border-[#2F2B3E] text-white rounded-xl py-4 pl-10 pr-4 outline-none focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 transition-all font-mono font-bold text-lg"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold px-1">
                        <span className="text-gray-500">Balance: {user.balance.toLocaleString()}</span>
                        <span className="text-gray-600">Min: 10</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-shake">
                        <AlertCircle size={12} /> {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-scale-in">
                        <ShieldCheck size={12} /> Rain sent successfully!
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isSending || success}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                    {isSending ? 'PROCESSING...' : (
                        <>
                            CONFIRM RAIN <CloudRain size={16} fill="currentColor" />
                        </>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default TipRainModal;
