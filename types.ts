

export enum GameType {
  CRASH = 'CRASH',
  COINFLIP = 'COINFLIP',
  MINES = 'MINES',
  CASES = 'CASES',
  BATTLES = 'BATTLES',
  TOWERS = 'TOWERS',
  UPGRADER = 'UPGRADER',
  BLACKJACK = 'BLACKJACK',
  PLINKO = 'PLINKO',
  ROULETTE = 'ROULETTE'
}

export type AuthMode = 'LOGIN' | 'SIGNUP';

export interface UserState {
  id?: string; // Unique ID for DB sync
  balance: number;
  username: string;
  avatar?: string;
  email?: string;
  isLoggedIn: boolean;
  level: number;
  xp: number;
  claimedLevels: number[]; // Array of level numbers that have been claimed
  usernameChanged?: boolean; // Track if user has already changed their name
  totalWagered: number; // Total amount wagered all-time
  referralCode?: string;
  affiliateEarnings?: number;
  totalReferred?: number;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  totalWagered: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string; // Links to auth user
  type: 'self' | 'other' | 'bot' | 'system';
  username: string;
  avatar?: string;
  text: string;
  created_at?: string; // Database timestamp
  timestamp: Date; // Frontend object
  rank?: 'OWNER' | 'ADMIN' | 'MOD' | 'VIP' | 'USER' | 'SYSTEM';
}

export interface GameProps {
  balance: number;
  updateBalance: (amount: number) => void;
  onPlay: (amount: number) => void; // Hook for sound/analytics
  isLoggedIn: boolean;
  onOpenLogin: () => void;
}