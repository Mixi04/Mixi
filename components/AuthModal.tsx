
import React, { useState, useEffect } from 'react';
import { UserState, AuthMode } from '../types';
import { supabase } from '../supabaseClient';
import { X, Lock, User, ArrowRight, AlertCircle, Share2, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  onLogin: (user: Partial<UserState>) => void;
  onClose: () => void;
  initialMode: AuthMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose, initialMode }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    referralCode: ''
  });

  // Check URL for referral code on mount (Query Param OR Path)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    
    if (refParam) {
        setFormData(prev => ({ ...prev, referralCode: refParam }));
        setIsReferralLocked(true);
        return;
    }

    const path = window.location.pathname.replace('/', '');
    const reservedRoutes = ['crash', 'coinflip', 'mines', 'leaderboard', 'affiliates', 'settings', 'profile', 'blackjack', ''];
    
    if (path && !reservedRoutes.includes(path.toLowerCase())) {
        setFormData(prev => ({ ...prev, referralCode: path }));
        setIsReferralLocked(true);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = formData.username.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const syntheticEmail = `${cleanUsername}@moonblox.com`;

    try {
        if (mode === 'SIGNUP') {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: syntheticEmail,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        invited_by_code: formData.referralCode || null
                    }
                }
            });
            if (signUpError) throw signUpError;
            
            // Auto-login attempt immediately after signup
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: syntheticEmail,
                password: formData.password
            });

            if (signInError || !signInData.session) {
                 // Account created but session not active (likely needs email verify or latency)
                 setMode('LOGIN');
                 setSuccessMsg('Account created! Please log in to continue.');
                 setIsLoading(false);
                 return;
            }
            
            // Login successful
            onClose();

        } else {
            // LOGIN FLOW
             const { data, error } = await supabase.auth.signInWithPassword({
                email: syntheticEmail,
                password: formData.password
            });
            if (error) {
                 if (error.message.includes('Invalid login credentials')) {
                     throw new Error('Incorrect username or password');
                 }
                 throw error;
            }
            onClose();
        }
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-md bg-[#151B25] border border-[#2A3441] rounded-3xl p-8 shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blox-accent to-yellow-600 shadow-lg shadow-yellow-500/20 mb-4">
             <User className="text-black w-7 h-7 font-bold" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            {mode === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {mode === 'SIGNUP' ? 'Join the winning team today.' : 'Enter your credentials to continue.'}
          </p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-3 animate-shake">
                <AlertCircle size={18} className="shrink-0" />
                {error}
            </div>
        )}

        {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-3 animate-slide-up">
                <CheckCircle size={18} className="shrink-0" />
                {successMsg}
            </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5 mb-8">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blox-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full bg-[#0B0E14] border-2 border-[#2F2B3E] text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blox-accent transition-all font-bold text-sm placeholder-gray-700"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blox-accent transition-colors" />
                    <input 
                        type="password" 
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-[#0B0E14] border-2 border-[#2F2B3E] text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blox-accent transition-all font-bold text-sm placeholder-gray-700"
                        required
                    />
                </div>
            </div>

            {mode === 'SIGNUP' && (
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Referral Code (Optional)</label>
                    <div className="relative group">
                        {isReferralLocked ? (
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                        ) : (
                             <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blox-accent transition-colors" />
                        )}
                        <input 
                            type="text" 
                            placeholder="Promo Code"
                            value={formData.referralCode}
                            onChange={(e) => !isReferralLocked && setFormData({...formData, referralCode: e.target.value})}
                            readOnly={isReferralLocked}
                            className={`w-full bg-[#0B0E14] border-2 text-white rounded-xl py-4 pl-12 pr-20 outline-none transition-all font-bold text-sm placeholder-gray-700 
                                ${isReferralLocked 
                                    ? 'border-emerald-500/50 focus:border-emerald-500 cursor-not-allowed text-emerald-400' 
                                    : 'border-[#2F2B3E] focus:border-blox-accent'}`}
                        />
                        {isReferralLocked && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide">
                                <CheckCircle size={10} />
                                Applied
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blox-accent hover:bg-blox-accentHover text-blox-surface font-black py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 text-base"
            >
                {isLoading ? (
                     <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                    <>
                        {mode === 'SIGNUP' ? 'START PLAYING' : 'LOG IN NOW'}
                        <ArrowRight size={20} strokeWidth={3} />
                    </>
                )}
            </button>
        </form>

        <div className="text-center border-t border-[#2A3441] pt-6">
            <p className="text-gray-400 text-sm font-medium">
                {mode === 'SIGNUP' ? 'Already have an account?' : 'New to MoonBlox?'}
                <button 
                    onClick={() => {
                        setMode(mode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP');
                        setError(null);
                        setSuccessMsg(null);
                        if (!isReferralLocked) {
                            setFormData({ username: '', password: '', referralCode: '' });
                        } else {
                            setFormData(prev => ({ ...prev, username: '', password: '' }));
                        }
                    }}
                    className="ml-2 text-blox-accent hover:text-white font-black uppercase transition-colors"
                >
                    {mode === 'SIGNUP' ? 'Log In' : 'Sign Up'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
