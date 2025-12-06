
import React, { useEffect, useState } from 'react';
import { UserState } from '../types';
import { supabase } from '../supabaseClient';
import { Trophy, Crown, ChevronRight, Moon, Loader2 } from 'lucide-react';

interface LeaderboardProps {
    user: UserState;
    onGoHome: () => void;
}

interface LeaderboardUser {
    id: string;
    username: string;
    avatar?: string;
    level: number;
    total_wagered: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, onGoHome }) => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar, level, total_wagered')
            .order('total_wagered', { ascending: false })
            .limit(50);
        
        if (data) {
            // Map data to ensure no nulls
            const formatted = data.map((u: any) => ({
                id: u.id,
                username: u.username || 'Hidden User',
                avatar: u.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.username || 'unknown'}`,
                level: u.level || 0,
                total_wagered: Number(u.total_wagered) || 0
            }));
            setLeaders(formatted);
        }
        setIsLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const topThree = leaders.slice(0, 3);
  const restList = leaders.slice(3);

  // Helper to safely get user at index
  const getLeader = (index: number) => leaders[index] || null;

  return (
    <div className="w-full animate-fade-in p-6 max-w-6xl mx-auto">
        {/* Navigation */}
        <button onClick={onGoHome} className="mb-6 text-gray-500 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
            <ChevronRight className="rotate-180" size={16}/> Back to Home
        </button>

        <div className="text-center mb-12">
            <h1 className="text-4xl font-black italic tracking-tighter text-white flex items-center justify-center gap-3 mb-2">
                <Trophy className="text-[#F59E0B] fill-[#F59E0B]" size={32} />
                LEADERBOARD
            </h1>
            <p className="text-gray-400 font-medium">Top players by total wagered amount (All Time)</p>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 size={48} className="text-blox-accent animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Loading Rankings...</p>
            </div>
        ) : (
            <>
                {/* Podium Section - Only show if we have enough players */}
                {leaders.length > 0 && (
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 px-4">
                        
                        {/* 2nd Place */}
                        {getLeader(1) && (
                            <div className="order-2 md:order-1 w-full md:w-1/3 max-w-[280px] flex flex-col items-center">
                                <div className="relative mb-4 group">
                                    <div className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-[0_0_30px_rgba(209,213,219,0.3)] overflow-hidden bg-[#151B25] relative z-10">
                                        <img src={getLeader(1)?.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-black font-black text-sm px-3 py-1 rounded-lg border-2 border-[#151B25] z-20 flex items-center gap-1">
                                        2ND
                                    </div>
                                </div>
                                <div className="w-full bg-[#151B25]/80 border-t-4 border-gray-300 rounded-t-2xl p-6 text-center backdrop-blur-md h-[180px] flex flex-col justify-end">
                                    <div className="text-xl font-black text-white mb-1 truncate w-full">{getLeader(1)?.username}</div>
                                    <div className="text-xs font-bold text-gray-400 mb-3">Level {getLeader(1)?.level}</div>
                                    <div className="bg-[#0B0E14] rounded-lg py-2 px-3 border border-gray-300/20">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Wagered</div>
                                        <div className="text-gray-300 font-mono font-bold flex items-center justify-center gap-1">
                                            <Moon size={12} fill="currentColor" />
                                            {getLeader(1)?.total_wagered.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {getLeader(0) && (
                            <div className="order-1 md:order-2 w-full md:w-1/3 max-w-[320px] flex flex-col items-center -mt-12 z-10">
                                <div className="relative mb-6 group animate-float">
                                    <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 text-[#F59E0B] fill-[#F59E0B] w-12 h-12 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce-short" />
                                    <div className="w-32 h-32 rounded-full border-4 border-[#F59E0B] shadow-[0_0_50px_rgba(245,158,11,0.5)] overflow-hidden bg-[#151B25] relative z-10">
                                        <img src={getLeader(0)?.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F59E0B] to-yellow-300 text-black font-black text-lg px-6 py-1 rounded-xl border-4 border-[#151B25] z-20 shadow-lg">
                                        1ST
                                    </div>
                                </div>
                                <div className="w-full bg-gradient-to-b from-[#F59E0B]/20 to-[#151B25]/90 border-t-4 border-[#F59E0B] rounded-t-2xl p-8 text-center backdrop-blur-xl h-[220px] flex flex-col justify-end shadow-[0_-10px_40px_rgba(245,158,11,0.1)]">
                                    <div className="text-2xl font-black text-white mb-1 truncate w-full">{getLeader(0)?.username}</div>
                                    <div className="text-sm font-bold text-[#F59E0B] mb-4">Level {getLeader(0)?.level}</div>
                                    <div className="bg-[#0B0E14] rounded-lg py-3 px-4 border border-[#F59E0B]/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Wagered</div>
                                        <div className="text-[#F59E0B] font-mono font-bold text-lg flex items-center justify-center gap-1">
                                            <Moon size={14} fill="currentColor" />
                                            {getLeader(0)?.total_wagered.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {getLeader(2) && (
                            <div className="order-3 md:order-3 w-full md:w-1/3 max-w-[280px] flex flex-col items-center">
                                <div className="relative mb-4 group">
                                    <div className="w-24 h-24 rounded-full border-4 border-orange-700 shadow-[0_0_30px_rgba(194,65,12,0.3)] overflow-hidden bg-[#151B25] relative z-10">
                                        <img src={getLeader(2)?.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black text-sm px-3 py-1 rounded-lg border-2 border-[#151B25] z-20 flex items-center gap-1">
                                        3RD
                                    </div>
                                </div>
                                <div className="w-full bg-[#151B25]/80 border-t-4 border-orange-700 rounded-t-2xl p-6 text-center backdrop-blur-md h-[160px] flex flex-col justify-end">
                                    <div className="text-xl font-black text-white mb-1 truncate w-full">{getLeader(2)?.username}</div>
                                    <div className="text-xs font-bold text-gray-400 mb-3">Level {getLeader(2)?.level}</div>
                                    <div className="bg-[#0B0E14] rounded-lg py-2 px-3 border border-orange-700/20">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Wagered</div>
                                        <div className="text-orange-400 font-mono font-bold flex items-center justify-center gap-1">
                                            <Moon size={12} fill="currentColor" />
                                            {getLeader(2)?.total_wagered.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* List Section */}
                <div className="bg-[#151B25] border border-[#2A3441] rounded-2xl overflow-hidden shadow-2xl">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-4 bg-[#0F1219] border-b border-[#2A3441] text-xs font-bold text-gray-500 uppercase">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-7 pl-4">Player</div>
                        <div className="col-span-5 md:col-span-4 text-right">Total Wagered</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-[#2A3441]">
                        {restList.length === 0 && leaders.length <= 3 && (
                            <div className="p-8 text-center text-gray-500 font-bold italic">
                                Play more to fill up the leaderboard!
                            </div>
                        )}
                        {restList.map((player, index) => (
                            <div key={player.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#1A212D] transition-colors group">
                                <div className="col-span-1 text-center">
                                    <span className="font-mono font-bold text-gray-400 group-hover:text-white">#{index + 4}</span>
                                </div>
                                <div className="col-span-6 md:col-span-7 pl-4 flex items-center gap-3">
                                    <img src={player.avatar} alt="" className="w-8 h-8 rounded-lg bg-[#0B0E14] object-cover" />
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-white group-hover:text-blox-accent transition-colors truncate">{player.username}</div>
                                        <div className="text-[10px] text-gray-600 font-bold">Level {player.level}</div>
                                    </div>
                                </div>
                                <div className="col-span-5 md:col-span-4 text-right">
                                     <div className="text-sm font-mono font-bold text-white flex items-center justify-end gap-2">
                                        <Moon size={14} className="text-gray-600 group-hover:text-blox-accent transition-colors" fill="currentColor" />
                                        {player.total_wagered.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Current User Rank (Sticky Bottom) */}
                    {user.isLoggedIn && (
                         <div className="bg-[#0B0E14] border-t-2 border-[#2A3441] px-6 py-4 grid grid-cols-12 items-center">
                            <div className="col-span-1 text-center">
                                <span className="font-mono font-bold text-gray-500">
                                    {leaders.findIndex(l => l.username === user.username) >= 0 ? 
                                     `#${leaders.findIndex(l => l.username === user.username) + 1}` : '-'}
                                </span>
                            </div>
                            <div className="col-span-6 md:col-span-7 pl-4 flex items-center gap-3">
                                <img src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`} alt="" className="w-8 h-8 rounded-lg bg-[#151B25] border border-blox-accent object-cover" />
                                <div>
                                    <div className="text-sm font-bold text-blox-accent">You</div>
                                    <div className="text-[10px] text-gray-500 font-bold">Level {user.level}</div>
                                </div>
                            </div>
                            <div className="col-span-5 md:col-span-4 text-right">
                                 <div className="text-sm font-mono font-bold text-white flex items-center justify-end gap-2">
                                    <Moon size={14} className="text-blox-accent" fill="currentColor" />
                                    {user.totalWagered.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        )}
    </div>
  );
};

export default Leaderboard;
