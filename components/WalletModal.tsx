
import React, { useState } from 'react';
import { UserState } from '../types';
import { 
    X, Wallet, ArrowDownCircle, ArrowUpCircle, History, 
    Copy, CheckCircle, ChevronRight, AlertCircle, 
    CreditCard, Smartphone, RefreshCw, Moon, QrCode, Shield, Info, Check
} from 'lucide-react';

interface WalletModalProps {
  user: UserState;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  initialTab?: 'DEPOSIT' | 'WITHDRAW';
}

type CryptoOption = {
    symbol: string;
    name: string;
    network: string;
    color: string;
    rate: number; // M per 1 unit
    minDeposit: number;
    address: string;
};

const CRYPTO_OPTIONS: CryptoOption[] = [
    { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', color: 'bg-[#F7931A]', rate: 25000000, minDeposit: 0.0005, address: '0x4f6fcecb57f47575d3fb874e9cf03359b4d3f9b7' },
    { symbol: 'ETH', name: 'Ethereum', network: 'ERC-20', color: 'bg-[#627EEA]', rate: 1800000, minDeposit: 0.01, address: '0x4f6fcecb57f47575d3fb874e9cf03359b4d3f9b7' },
    { symbol: 'LTC', name: 'Litecoin', network: 'Litecoin', color: 'bg-[#345D9D]', rate: 85000, minDeposit: 0.1, address: 'LXzYWJ9uAiR2RvWj28SLZubQrdzeiEiRXX' },
    { symbol: 'USDT', name: 'Tether', network: 'ERC-20', color: 'bg-[#26A17B]', rate: 1000, minDeposit: 5, address: '0x4f6fcecb57f47575d3fb874e9cf03359b4d3f9b7' },
    { symbol: 'DOGE', name: 'Dogecoin', network: 'Dogecoin', color: 'bg-[#C2A633]', rate: 75, minDeposit: 50, address: '0x4f6fcecb57f47575d3fb874e9cf03359b4d3f9b7' },
    { symbol: 'TRX', name: 'Tron', network: 'TRC-20', color: 'bg-[#FF0013]', rate: 80, minDeposit: 50, address: 'T9yD14Nj9j77z7z7z7z7z7z7z7z7z7z7z7' },
];

const WalletModal: React.FC<WalletModalProps> = ({ user, onClose, onDeposit, onWithdraw, initialTab = 'DEPOSIT' }) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>(initialTab);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[0]);
  const [depositMethod, setDepositMethod] = useState<'CRYPTO' | 'ROBUX'>('CRYPTO');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(selectedCrypto.address);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
        onDeposit(depositMethod === 'ROBUX' ? 1000 : 5000);
        setIsProcessing(false);
        onClose();
    }, 2000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0 || amount > user.balance) return;

    setIsProcessing(true);
    setTimeout(() => {
        onWithdraw(amount);
        setIsProcessing(false);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative w-full max-w-5xl h-[700px] bg-[#0B0E14] border border-[#2A3441] rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-[#151B25] border-r border-[#2A3441] flex flex-col justify-between shrink-0">
            <div>
                <div className="p-6 border-b border-[#2A3441]">
                    <div className="flex items-center gap-2 text-white font-black italic text-xl">
                        <Wallet className="text-blox-accent" />
                        <span>Moon<span className="text-blox-accent">Wallet</span></span>
                    </div>
                </div>
                
                <div className="p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('DEPOSIT')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'DEPOSIT' ? 'bg-blox-accent text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowDownCircle size={18} /> Deposit
                    </button>
                    <button 
                        onClick={() => setActiveTab('WITHDRAW')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'WITHDRAW' ? 'bg-blox-accent text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowUpCircle size={18} /> Withdraw
                    </button>
                    <button 
                        onClick={() => setActiveTab('HISTORY')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'HISTORY' ? 'bg-blox-accent text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <History size={18} /> Transactions
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="bg-[#0B0E14] rounded-xl p-4 border border-[#2A3441]">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Balance</div>
                    <div className="text-xl font-black text-white flex items-center gap-2">
                        <Moon size={18} className="text-blox-accent fill-blox-accent" />
                        {user.balance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono mt-1">≈ ${(user.balance * 0.0035).toFixed(2)} USD</div>
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F1219] relative">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white bg-[#151B25] hover:bg-[#2A3441] rounded-full transition-colors z-20"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-hidden flex flex-col">
                
                {/* DEPOSIT TAB */}
                {activeTab === 'DEPOSIT' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {/* Header Area */}
                        <div className="px-8 pt-8 pb-4">
                            <h2 className="text-3xl font-black text-white mb-2">Deposit Funds</h2>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-400 text-sm font-medium">Add funds securely via Crypto or Roblox.</p>
                                
                                {/* Method Toggle */}
                                <div className="flex bg-[#151B25] p-1 rounded-xl border border-[#2A3441]">
                                    <button 
                                        onClick={() => setDepositMethod('CRYPTO')}
                                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${depositMethod === 'CRYPTO' ? 'bg-[#2A3441] text-white shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Crypto
                                    </button>
                                    <button 
                                        onClick={() => setDepositMethod('ROBUX')}
                                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${depositMethod === 'ROBUX' ? 'bg-[#2A3441] text-white shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Robux
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden p-8 pt-2">
                            {depositMethod === 'CRYPTO' ? (
                                <div className="flex flex-col lg:flex-row gap-6 h-full">
                                    
                                    {/* Left Column: Asset Selection */}
                                    <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Select Asset</div>
                                        {CRYPTO_OPTIONS.map(coin => (
                                            <button 
                                                key={coin.symbol}
                                                onClick={() => { setSelectedCrypto(coin); setCopied(false); }}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                                                    selectedCrypto.symbol === coin.symbol 
                                                    ? 'border-blox-accent bg-[#151B25] shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                                                    : 'border-[#2A3441] bg-[#151B25]/50 hover:bg-[#151B25] hover:border-gray-600'
                                                }`}
                                            >
                                                {selectedCrypto.symbol === coin.symbol && (
                                                    <div className="absolute inset-y-0 left-0 w-1 bg-blox-accent"></div>
                                                )}
                                                <div className={`w-10 h-10 rounded-full ${coin.color} flex items-center justify-center text-white font-black text-xs shadow-lg`}>
                                                    {coin.symbol[0]}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`text-sm font-bold ${selectedCrypto.symbol === coin.symbol ? 'text-white' : 'text-gray-300'}`}>{coin.name}</div>
                                                        {selectedCrypto.symbol === coin.symbol && <CheckCircle size={14} className="text-blox-accent" />}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-bold">{coin.network}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Right Column: Deposit Details */}
                                    <div className="flex-1 bg-[#151B25] border border-[#2A3441] rounded-3xl p-8 flex flex-col relative overflow-hidden">
                                        {/* Background Decoration */}
                                        <div className={`absolute top-0 right-0 w-64 h-64 ${selectedCrypto.color} blur-[120px] opacity-10 rounded-full pointer-events-none`}></div>

                                        <div className="flex items-center gap-4 mb-8 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl ${selectedCrypto.color} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/20`}>
                                                {selectedCrypto.symbol[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white">{selectedCrypto.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#0B0E14] border border-[#2A3441] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {selectedCrypto.network} Network
                                                    </span>
                                                    <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                                                        <Shield size={10} /> Secure
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center flex-1 relative z-10">
                                            {/* QR Code Frame */}
                                            {selectedCrypto.symbol !== 'BTC' && (
                                                <div className="bg-white p-4 rounded-3xl mb-8 relative group shadow-2xl">
                                                    <div className="absolute inset-0 border-4 border-dashed border-gray-900/10 rounded-3xl pointer-events-none"></div>
                                                    <div className="absolute -inset-1 rounded-[28px] border border-white/20 pointer-events-none"></div>
                                                    
                                                    {/* Dynamic QR Code */}
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${selectedCrypto.address}&bgcolor=ffffff`}
                                                        alt={`${selectedCrypto.name} QR Code`}
                                                        className="w-40 h-40 object-contain"
                                                    />
                                                    
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        Scan to Pay
                                                    </div>
                                                </div>
                                            )}

                                            <div className="w-full max-w-md space-y-3">
                                                <div className="flex justify-between items-end px-1">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Deposit Address</label>
                                                    {copied && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 animate-fade-in"><Check size={10} /> Copied</span>}
                                                </div>
                                                
                                                <button 
                                                    onClick={handleCopy}
                                                    className="w-full bg-[#0B0E14] border border-[#2A3441] hover:border-blox-accent/50 rounded-xl p-4 flex items-center justify-between group transition-all relative overflow-hidden"
                                                >
                                                    <code className="text-sm text-gray-300 font-mono truncate mr-4">{selectedCrypto.address}</code>
                                                    <div className="bg-[#151B25] p-2 rounded-lg group-hover:bg-blox-accent group-hover:text-black transition-colors">
                                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                                    </div>
                                                </button>

                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3">
                                                    <Info size={18} className="text-blue-400 shrink-0" />
                                                    <div className="text-left">
                                                        <p className="text-[11px] text-blue-200 leading-snug">
                                                            Only send <span className="font-bold text-white">{selectedCrypto.symbol}</span> on the <span className="font-bold text-white">{selectedCrypto.network}</span> network.
                                                            Minimum deposit: <span className="font-bold text-white">{selectedCrypto.minDeposit} {selectedCrypto.symbol}</span>.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end">
                                            <button 
                                                onClick={handleSimulateDeposit}
                                                disabled={isProcessing}
                                                className="bg-blox-accent hover:bg-blox-accentHover text-black font-black text-sm px-8 py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/10 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : 'I Have Sent Funds'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="bg-[#151B25] p-10 rounded-3xl border border-[#2A3441] flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00A2FF] to-cyan-400"></div>
                                        
                                        <div className="w-20 h-20 bg-[#00A2FF]/10 text-[#00A2FF] rounded-3xl flex items-center justify-center mb-6 border border-[#00A2FF]/20 shadow-[0_0_40px_rgba(0,162,255,0.15)]">
                                            <Smartphone size={40} />
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-white mb-3">Roblox Instant Deposit</h3>
                                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                                            Purchase our official Gamepass on Roblox to instantly credit your MoonBlox account. No wait times.
                                        </p>
                                        
                                        <div className="grid grid-cols-3 gap-3 w-full mb-8">
                                            {[100, 500, 1000, 2500, 5000, 10000].map(amount => (
                                                <button key={amount} className="group relative bg-[#0B0E14] border border-[#2A3441] hover:border-[#00A2FF] rounded-xl p-3 transition-all hover:-translate-y-1">
                                                    <div className="text-white font-black text-sm">{amount.toLocaleString()} M</div>
                                                    <div className="text-[10px] text-gray-500 font-bold group-hover:text-[#00A2FF] transition-colors">{Math.floor(amount * 1.43)} R$</div>
                                                </button>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={handleSimulateDeposit}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-[#00A2FF] hover:bg-[#008bd9] text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-95"
                                        >
                                            {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : 'Purchase Gamepass on Roblox'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* WITHDRAW TAB */}
                {activeTab === 'WITHDRAW' && (
                    <div className="h-full overflow-y-auto p-8 pt-4 animate-fade-in max-w-2xl mx-auto w-full">
                         <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-2">Withdraw Funds</h2>
                            <p className="text-gray-400 text-sm">Cash out your winnings directly to your crypto wallet.</p>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-6 bg-[#151B25] p-8 rounded-3xl border border-[#2A3441] shadow-xl">
                            
                            {/* Asset Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Withdraw Asset</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-[#0B0E14] border border-[#2A3441] text-white rounded-xl py-4 pl-4 pr-10 outline-none focus:border-blox-accent appearance-none cursor-pointer font-bold text-sm"
                                    >
                                        {CRYPTO_OPTIONS.map(c => (
                                            <option key={c.symbol} value={c.symbol}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blox-accent rounded-full w-6 h-6 flex items-center justify-center text-black text-[10px] font-black shadow-lg">M</div>
                                    <input 
                                        type="number" 
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#2A3441] text-white rounded-xl py-4 pl-14 pr-20 outline-none focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 transition-all font-mono font-bold text-lg placeholder-gray-700"
                                        placeholder="0.00"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setWithdrawAmount(user.balance.toString())}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black bg-[#151B25] hover:bg-white text-gray-400 hover:text-black px-3 py-1.5 rounded-lg transition-colors border border-[#2A3441]"
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold px-1 text-gray-500">
                                    <span>Available: {user.balance.toLocaleString()} M</span>
                                    <span>Min: 500 M</span>
                                </div>
                            </div>

                            {/* Address Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Destination Address</label>
                                <input 
                                    type="text" 
                                    value={withdrawAddress}
                                    onChange={(e) => setWithdrawAddress(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#2A3441] text-white rounded-xl py-4 px-4 outline-none focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 transition-all font-mono text-sm placeholder-gray-700 font-medium"
                                    placeholder="Paste your address here..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-[#0B0E14] rounded-xl p-4 space-y-2 border border-[#2A3441]">
                                <div className="flex justify-between text-xs text-gray-400 font-medium">
                                    <span>Network Fee</span>
                                    <span>25.00 M</span>
                                </div>
                                <div className="border-t border-[#2A3441] pt-2 flex justify-between text-sm font-bold text-white">
                                    <span>Total Received</span>
                                    <span>{Math.max(0, (parseInt(withdrawAmount) || 0) - 25).toLocaleString()} M</span>
                                </div>
                            </div>

                             <button 
                                type="submit"
                                disabled={isProcessing || !withdrawAmount}
                                className="w-full py-4 rounded-xl font-black text-sm bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : 'Request Withdrawal'}
                            </button>
                        </form>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'HISTORY' && (
                     <div className="h-full overflow-y-auto p-8 pt-4 animate-fade-in space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Transactions</h2>
                            <p className="text-gray-400 text-sm">View your recent deposit and withdrawal history.</p>
                        </div>

                        <div className="space-y-3">
                            {/* Fake History Data */}
                            {[1,2,3,4,5,6].map((i) => (
                                <div key={i} className="bg-[#151B25] border border-[#2A3441] p-4 rounded-2xl flex items-center justify-between hover:bg-[#1A212D] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${i % 2 === 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {i % 2 === 0 ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{i % 2 === 0 ? 'Deposit' : 'Withdrawal'} - {i % 2 === 0 ? 'Ethereum' : 'Bitcoin'}</div>
                                            <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold text-sm ${i % 2 === 0 ? 'text-green-400' : 'text-white'}`}>
                                            {i % 2 === 0 ? '+' : '-'}{(i * 2500).toLocaleString()} M
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold bg-[#0B0E14] px-2 py-0.5 rounded-lg inline-block mt-1 border border-[#2A3441]">Completed</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
