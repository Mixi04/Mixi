

import React, { useState, useEffect, useRef } from 'react';
import { Bot, User as UserIcon, MessageSquare, CloudRain, Lock, Moon, Clock, ChevronDown, Trash2, Crown, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';
import { supabase } from '../supabaseClient';

interface ChatProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    avatar?: string;
    isLoggedIn: boolean;
    onOpenLogin: () => void;
    onUserClick: (userId: string) => void;
    onOpenTipRain: () => void;
    isAdmin?: boolean;
}

interface RainPool {
    amount: number;
    ends_at: string;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, username, avatar, isLoggedIn, onOpenLogin, onUserClick, onOpenTipRain, isAdmin = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineUsers] = useState(1284);
  const [rainPool, setRainPool] = useState<RainPool>({ amount: 0, ends_at: new Date().toISOString() });
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [isChatLocked, setIsChatLocked] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const usernameRef = useRef(username);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) {
            const formatted: ChatMessage[] = data.map((msg: any) => ({
                id: msg.id,
                user_id: msg.user_id,
                type: msg.username === usernameRef.current ? 'self' : 'other',
                username: msg.username,
                text: msg.text,
                timestamp: new Date(msg.created_at),
                rank: msg.rank,
                avatar: msg.avatar
            })).reverse();
            setMessages(formatted);
        }
    };
    const fetchRainPool = async () => {
        const { data } = await supabase.from('rain_pool').select('*').single();
        if (data) setRainPool({ amount: Number(data.amount), ends_at: data.ends_at });
    };
    
    fetchMessages();
    fetchRainPool();

    // Subscribe to new messages & DELETES
    const channel = supabase.channel('global-chat-room')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            const newMsg = payload.new as any;
            if (!newMsg) return;

            setMessages((prev) => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, {
                    id: newMsg.id,
                    user_id: newMsg.user_id,
                    type: newMsg.username === usernameRef.current ? 'self' : 'other',
                    username: newMsg.username,
                    text: newMsg.text,
                    timestamp: new Date(newMsg.created_at),
                    rank: newMsg.rank,
                    avatar: newMsg.avatar
                }];
            });
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
            if (payload.old.id) {
                setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rain_pool' }, (payload) => {
            const newData = payload.new as any;
            if (newData) setRainPool({ amount: Number(newData.amount), ends_at: newData.ends_at });
        })
        .subscribe();

    // Subscribe to Admin Commands (Broadcast)
    const adminChannel = supabase.channel('admin-commands')
        .on('broadcast', { event: 'LOCK_CHAT' }, () => setIsChatLocked(true))
        .on('broadcast', { event: 'UNLOCK_CHAT' }, () => setIsChatLocked(false))
        .subscribe();

    return () => { 
        supabase.removeChannel(channel); 
        supabase.removeChannel(adminChannel);
    };
  }, []);

  // Discord Bot Auto-Message (Every 20 Minutes)
  useEffect(() => {
    const discordInterval = setInterval(() => {
        const botMsg: ChatMessage = {
            id: `discord-bot-${Date.now()}`,
            type: 'bot',
            username: 'Discord Bot',
            text: 'Join our official Discord community! https://discord.gg/EtNnJcMd8X',
            timestamp: new Date(),
            rank: 'SYSTEM',
            avatar: 'https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
        };
        setMessages(prev => [...prev, botMsg]);
    }, 20 * 60 * 1000); // 20 minutes in ms

    return () => clearInterval(discordInterval);
  }, []);

  // Rain Timer
  useEffect(() => {
      const interval = setInterval(() => {
          const end = new Date(rainPool.ends_at).getTime();
          const now = new Date().getTime();
          const diff = end - now;
          if (diff <= 0) setTimeLeft('Distributing...');
          else {
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [rainPool.ends_at]);

  // Update 'type' (self/other) if username changes
  useEffect(() => {
      setMessages(prev => prev.map(msg => ({ ...msg, type: msg.username === username ? 'self' : 'other' })));
  }, [username]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isLoggedIn) return;
    if (isChatLocked && !isAdmin) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const textToSend = inputValue;
    setInputValue('');
    
    // Determine Rank
    let rank: 'OWNER' | 'MOD' | 'USER' | 'VIP' | 'SYSTEM' = 'USER';
    if (username === 'Mixi' || username === 'Pinky') {
        rank = 'OWNER';
    } else if (isAdmin) {
        rank = 'MOD';
    }

    // 1. Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
        id: tempId,
        user_id: user.id,
        type: 'self',
        username: username,
        text: textToSend,
        timestamp: new Date(),
        rank: rank,
        avatar: avatar
    };

    setMessages(prev => [...prev, optimisticMsg]);

    // 2. Send to Backend
    const { data, error } = await supabase.from('messages').insert({
        user_id: user.id, 
        username: username, 
        text: textToSend, 
        avatar: avatar, 
        rank: rank
    }).select().single();

    if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setInputValue(textToSend);
    } else if (data) {
        setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev.filter(m => m.id !== tempId);
            return prev.map(m => m.id === tempId ? { ...m, id: data.id, timestamp: new Date(data.created_at) } : m);
        });
    }
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blox-accent hover:text-white underline decoration-blox-accent/30 hover:decoration-white/50 transition-colors break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#151921] z-30 shadow-2xl border-l border-white/5">
        {/* Header */}
        <div className="h-[76px] flex items-center justify-between px-5 border-b border-white/5 bg-[#0B0E14]">
             <div className="flex items-center gap-2.5">
                 <div className={`w-2 h-2 rounded-full ${isChatLocked ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                 <span className="text-sm font-black text-white uppercase tracking-wide">Global Chat</span>
             </div>
             <div className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">{onlineUsers.toLocaleString()} Online</div>
        </div>

        {/* Rain Widget */}
        <div className="p-4 border-b border-white/5 bg-[#0F1219]">
             <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                          <div className="text-[10px] font-black text-indigo-300 uppercase mb-0.5 flex items-center gap-1.5">
                              <CloudRain size={12} className="text-indigo-400" /> Rain Pool
                          </div>
                          <div className="text-xl font-mono font-bold text-white flex items-center gap-1.5 drop-shadow-md">
                              <Moon size={16} className="text-indigo-400" fill="currentColor"/>
                              {rainPool.amount.toLocaleString()}
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] font-black text-indigo-300 uppercase mb-0.5">Ending In</div>
                          <div className="text-sm font-mono font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/20">{timeLeft}</div>
                      </div>
                  </div>
                  <button 
                    onClick={onOpenTipRain}
                    className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 relative z-10 uppercase tracking-wide hover:translate-y-[-1px]"
                  >
                      ADD TO RAIN <ChevronDown size={10} />
                  </button>
             </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#151921]" ref={scrollRef}>
             {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 opacity-50">
                     <MessageSquare size={32} />
                     <span className="text-xs font-bold">Start the conversation</span>
                 </div>
             )}
             {messages.map(msg => (
                 <div key={msg.id} className={`flex gap-3 animate-fade-in group ${msg.rank === 'SYSTEM' ? 'p-3 bg-white/5 rounded-xl border border-white/5' : ''}`}>
                    {/* Avatar */}
                    <div 
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity mt-0.5"
                        onClick={() => msg.user_id && msg.rank !== 'SYSTEM' && onUserClick(msg.user_id)}
                    >
                        {msg.rank === 'SYSTEM' ? (
                             <img 
                                src={msg.avatar || "https://res.cloudinary.com/ddgmnys0o/image/upload/v1764978020/ef85ab4d-a03b-4b14-949b-07fcde55ec3d.png"} // Default system icon
                                alt="System"
                                className="w-9 h-9 rounded-xl bg-indigo-500/20 object-cover border border-indigo-500/30"
                             />
                        ) : msg.rank === 'OWNER' ? (
                             <div className="relative">
                                 <img 
                                    src={msg.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.username}`} 
                                    alt="" 
                                    className="w-9 h-9 rounded-xl bg-[#0B0E14] object-cover ring-2 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                 />
                                 <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full border border-[#0B0E14]">
                                     <Crown size={8} fill="currentColor" />
                                 </div>
                             </div>
                        ) : (
                             <img 
                                src={msg.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.username}`} 
                                alt="" 
                                className="w-9 h-9 rounded-xl bg-[#0B0E14] object-cover ring-2 ring-transparent group-hover:ring-white/10 shadow-sm"
                             />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span 
                                onClick={() => msg.user_id && msg.rank !== 'SYSTEM' && onUserClick(msg.user_id)}
                                className={`text-xs font-black cursor-pointer hover:underline ${
                                    msg.rank === 'OWNER' ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' :
                                    msg.rank === 'VIP' ? 'text-blox-accent' : 
                                    msg.rank === 'MOD' ? 'text-emerald-500' : 
                                    msg.rank === 'SYSTEM' ? 'text-indigo-400' : 'text-gray-300'
                                }`}
                            >
                                {msg.username}
                            </span>
                            {msg.rank === 'OWNER' && (
                                <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 rounded-md shadow-[0_0_10px_rgba(244,63,94,0.5)] border border-rose-400 flex items-center gap-0.5">
                                    <ShieldAlert size={8} /> OWNER
                                </span>
                            )}
                            {msg.rank === 'VIP' && <span className="bg-blox-accent text-black text-[9px] font-black px-1.5 rounded-md shadow-sm">VIP</span>}
                            {msg.rank === 'MOD' && <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 rounded-md shadow-sm">MOD</span>}
                            <span className="text-[9px] text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">{msg.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                        <div className={`text-[13px] leading-relaxed break-words font-medium ${msg.rank === 'SYSTEM' ? 'text-indigo-200' : 'text-gray-300'}`}>
                            {renderMessageText(msg.text)}
                        </div>
                    </div>
                 </div>
             ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-[#0B0E14]">
            {isLoggedIn ? (
                isChatLocked && !isAdmin ? (
                    <div className="w-full bg-red-900/10 border border-red-500/20 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-red-500 cursor-not-allowed">
                        <Lock size={12} /> Chat is currently locked
                    </div>
                ) : (
                    <div className="relative">
                        <input 
                            className="w-full bg-[#151921] border border-white/5 rounded-xl pl-4 pr-12 py-3.5 text-xs font-bold text-white placeholder-gray-500 focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 outline-none transition-all shadow-inner"
                            placeholder={isAdmin && isChatLocked ? "Chat is locked for users..." : "Type a message..."}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blox-accent text-black rounded-lg hover:bg-white transition-colors shadow-lg"
                        >
                            <ChevronDown size={14} className="rotate-[-90deg]" strokeWidth={3} />
                        </button>
                    </div>
                )
            ) : (
                <button 
                    onClick={onOpenLogin}
                    className="w-full bg-[#151921] border border-white/5 hover:border-blox-accent text-gray-500 hover:text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all group shadow-sm"
                >
                    <Lock size={12} className="group-hover:text-blox-accent" />
                    Sign in to chat
                </button>
            )}
            
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
                <a href="https://discord.gg/EtNnJcMd8X" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-[#5865F2]/10 text-[#5865F2] px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-colors">
                    Discord
                </a>
                <button className="flex-shrink-0 bg-[#1DA1F2]/10 text-[#1DA1F2] px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 transition-colors">
                    Twitter
                </button>
                 <button className="flex-shrink-0 bg-gray-800/50 text-gray-400 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/5 hover:bg-gray-700 transition-colors">
                    Support
                </button>
            </div>
        </div>
    </div>
  );
};

export default Chat;
