
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { Rocket, History, TrendingUp, Lock, Moon, Clock, Play } from 'lucide-react';

const Crash: React.FC<GameProps> = ({ balance, updateBalance, onPlay, isLoggedIn, onOpenLogin }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState(1.00);
  
  // Game Phases: IDLE -> RUNNING -> CRASHED (with cooldown) -> IDLE
  const [gamePhase, setGamePhase] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  
  // User State in current round
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutPoint, setCashOutPoint] = useState<number | null>(null);
  
  const [crashPoint, setCrashPoint] = useState(0);
  const [history, setHistory] = useState<number[]>([1.24, 2.55, 1.05, 8.44, 1.12]);
  const [cooldown, setCooldown] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  // Audio refs
  const tickSound = useRef<HTMLAudioElement | null>(null);

  // Growth Logic using requestAnimationFrame for 60FPS smoothness
  const updateGame = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current; // ms
    
    // Growth Formula: 1.00 * e^(growth_rate * seconds)
    // We use a simplified linear-to-exponential curve for better visual feel
    // Speed increases as multiplier gets higher
    
    // Calculate current multiplier based on time
    // 1ms = 0.00006 growth approx to reach 2x in ~5-6 seconds
    const seconds = elapsed / 1000;
    const calculatedMult = 1.00 + (seconds * 0.1) + (Math.pow(1.08, seconds) - 1);
    
    if (calculatedMult >= crashPoint) {
        setMultiplier(crashPoint);
        handleCrash(crashPoint);
    } else {
        setMultiplier(calculatedMult);
        animationRef.current = requestAnimationFrame(updateGame);
    }
  };

  const handleCrash = (finalValue: number) => {
      setGamePhase('CRASHED');
      setHistory(currentHist => [finalValue, ...currentHist.slice(0, 9)]);
      setCooldown(4); // 4 second cooldown
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  // Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Only resize if dimensions changed
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#1F2937'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal lines
        for (let i = 1; i < 5; i++) { const y = h - (h / 5) * i; ctx.moveTo(0, y); ctx.lineTo(w, y); }
        // Vertical lines
        for (let i = 1; i < 5; i++) { const x = (w / 5) * i; ctx.moveTo(x, 0); ctx.lineTo(x, 0); } 
        ctx.stroke();

        // Draw Curve
        if (gamePhase !== 'IDLE') {
            ctx.beginPath();
            ctx.moveTo(0, h);
            
            // X axis: Time/Progress (Clamped to prevent drawing off screen too much)
            // Y axis: Multiplier
            const maxGraphMult = Math.max(2, multiplier * 1.5);
            const progressX = Math.min((multiplier - 1) / (maxGraphMult - 1), 0.9);
            
            const x = w * progressX; 
            // Non-linear Y mapping to make the curve look nicer
            const y = h - (h * (1 - (1 / multiplier))); 

            // Create curve points for smoother look if we tracked history, 
            // but simple quadratic curve to current point is efficiently sufficient
            ctx.quadraticCurveTo(x * 0.5, h, x, y);

            const isCrashed = gamePhase === 'CRASHED';
            
            // Fill
            const fillGrad = ctx.createLinearGradient(0, h, 0, 0);
            fillGrad.addColorStop(0, isCrashed ? 'rgba(239, 68, 68, 0.0)' : 'rgba(99, 102, 241, 0.0)');
            fillGrad.addColorStop(1, isCrashed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)');
            
            ctx.fillStyle = fillGrad;
            ctx.lineTo(x, h);
            ctx.fill();

            // Stroke
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.quadraticCurveTo(x * 0.5, h, x, y);
            ctx.strokeStyle = isCrashed ? '#EF4444' : '#6366F1';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Rocket / Ball
            if (!isCrashed) {
                ctx.save();
                ctx.translate(x, y);
                // Rotate rocket based on slope approx
                ctx.rotate(-Math.PI / 4); 
                
                // Draw Rocket Icon or Dot
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#6366F1';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        }
    };

    let animationFrameId: number;
    const renderLoop = () => {
        draw();
        animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [multiplier, gamePhase]);

  // Cooldown Timer
  useEffect(() => {
    if (gamePhase === 'CRASHED' && cooldown > 0) {
        const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    } else if (gamePhase === 'CRASHED' && cooldown === 0) {
        // Reset for next round
        setGamePhase('IDLE');
        setMultiplier(1.00);
        setHasCashedOut(false);
        setCashOutPoint(null);
        startTimeRef.current = 0;
    }
  }, [cooldown, gamePhase]);

  // "Scammy" Probabilities (approx 3% house edge with uneven distribution)
  const getWeightedCrashPoint = () => {
    const r = Math.random();
    
    // House Edge: 3% instant crash at 1.00x - 1.04x
    if (r < 0.03) return 1.00 + Math.random() * 0.04;

    // Remaining 97% distribution
    // Using Pareto distribution logic roughly
    const val = 1 / (1 - r);
    // Cap at reasonable max for this demo but technically infinite
    return Math.min(val, 1000) * (0.95 + Math.random() * 0.1); 
  };

  const startGame = () => {
    if (!isLoggedIn) {
        onOpenLogin();
        return;
    }
    if (cooldown > 0 || gamePhase !== 'IDLE') return;
    if (betAmount > balance || betAmount <= 0) return;
    
    // Determine crash point immediately but keep it hidden
    // In a real app, this comes from server socket
    const cp = Math.floor(getWeightedCrashPoint() * 100) / 100;

    setCrashPoint(cp);
    setGamePhase('RUNNING');
    setHasCashedOut(false);
    setCashOutPoint(null);
    setMultiplier(1.00);
    updateBalance(-betAmount);
    onPlay(betAmount);
    
    // Reset Timer
    startTimeRef.current = 0; // Will be set on first frame
    animationRef.current = requestAnimationFrame(updateGame);
  };

  const cashOut = () => {
    if (gamePhase !== 'RUNNING' || hasCashedOut) return;
    setHasCashedOut(true);
    setCashOutPoint(multiplier);
    updateBalance(Math.floor(betAmount * multiplier));
  };

  // Format helpers
  const getStatusColor = () => {
      if (gamePhase === 'CRASHED') return 'text-red-500';
      if (hasCashedOut) return 'text-emerald-500';
      if (gamePhase === 'RUNNING') return 'text-white';
      return 'text-white';
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
         <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
             CRASH
         </h2>
         <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide mask-gradient-x">
            {history.map((val, idx) => (
                <div key={idx} className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-[#151B25] shadow-lg whitespace-nowrap ${val >= 2.0 ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30'}`}>
                    {val.toFixed(2)}x
                </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Canvas */}
        <div className={`lg:col-span-3 h-[450px] bg-[#0F1219] border-4 rounded-[36px] relative overflow-hidden shadow-2xl transition-all duration-300
            ${gamePhase === 'CRASHED' ? 'border-rose-500/40 shadow-[0_0_50px_rgba(225,29,72,0.2)]' : 
              hasCashedOut ? 'border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]' :
              gamePhase === 'RUNNING' ? 'border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.2)]' :
              'border-[#1E1B2E] shadow-[0_0_30px_rgba(255,255,255,0.05)]'
        }`}>
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0F1219] to-[#0F1219]"></div>
            
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 z-10" />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className={`text-7xl md:text-9xl font-black font-mono tracking-tighter transition-all duration-75 drop-shadow-2xl ${getStatusColor()}`}>
                    {multiplier.toFixed(2)}x
                </div>
                
                {gamePhase === 'CRASHED' && (
                    <div className="mt-4 text-rose-500 font-bold uppercase tracking-widest bg-rose-500/10 px-6 py-2 rounded-xl border border-rose-500/20 animate-bounce-short">
                        Crashed
                    </div>
                )}
                
                {hasCashedOut && (
                    <div className="mt-4 text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-6 py-2 rounded-xl border border-emerald-500/20 animate-slide-up">
                        Cashed Out @ {cashOutPoint?.toFixed(2)}x
                    </div>
                )}
                
                {gamePhase !== 'RUNNING' && cooldown > 0 && (
                     <div className="mt-8 flex items-center gap-2 bg-[#151B25] border border-white/10 px-6 py-3 rounded-full shadow-lg">
                        <Clock size={18} className="text-blox-accent" />
                        <span className="text-gray-300 font-bold text-sm uppercase">Next round in <span className="text-white text-lg">{cooldown}s</span></span>
                     </div>
                )}
            </div>
        </div>

        {/* Controls Sidebar */}
        <div className="lg:col-span-1 bg-[#151B25] border border-[#2A3441] rounded-3xl p-6 flex flex-col h-auto lg:h-[450px] shadow-xl">
           <div className="mb-6">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Bet Amount</label>
                <div className="bg-[#0B0E14] border border-[#2A3441] rounded-xl p-3 flex items-center mb-2 focus-within:border-indigo-500 transition-colors shadow-inner">
                    <Moon size={16} className="text-blox-accent mr-2" fill="currentColor" />
                    <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={gamePhase !== 'IDLE' || !isLoggedIn || cooldown > 0}
                        className="bg-transparent w-full outline-none font-mono font-bold text-white text-lg"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setBetAmount(betAmount * 2)} disabled={gamePhase !== 'IDLE' || !isLoggedIn || cooldown > 0} className="bg-[#1E293B] hover:bg-[#2A3441] py-2 rounded-lg text-[10px] font-black text-gray-400 hover:text-white uppercase transition-colors">2x</button>
                    <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} disabled={gamePhase !== 'IDLE' || !isLoggedIn || cooldown > 0} className="bg-[#1E293B] hover:bg-[#2A3441] py-2 rounded-lg text-[10px] font-black text-gray-400 hover:text-white uppercase transition-colors">1/2</button>
                </div>
           </div>

           <div className="mt-auto">
                {gamePhase === 'IDLE' || cooldown > 0 ? (
                     isLoggedIn ? (
                        <button 
                            onClick={startGame}
                            disabled={betAmount > balance || betAmount <= 0 || cooldown > 0}
                            className="w-full py-5 rounded-xl font-black text-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400 flex items-center justify-center gap-2 group"
                        >
                            {cooldown > 0 ? (
                                <span className="animate-pulse">WAIT {cooldown}s</span>
                            ) : (
                                <>
                                    PLACE BET <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            className="w-full py-5 rounded-xl font-black text-sm bg-[#1E293B] border border-[#2A3441] text-gray-400 hover:border-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Lock size={16} /> LOG IN TO PLAY
                        </button>
                    )
                ) : (
                    <button 
                        onClick={cashOut}
                        disabled={hasCashedOut || gamePhase === 'CRASHED'}
                        className={`w-full py-5 rounded-xl font-black text-xl transition-all shadow-lg transform active:scale-95 ${
                            hasCashedOut || gamePhase === 'CRASHED' 
                                ? 'bg-[#1E293B] text-gray-500 cursor-not-allowed border border-white/5' 
                                : 'bg-emerald-500 hover:bg-emerald-400 text-[#020617] shadow-emerald-500/40 hover:shadow-emerald-500/60'
                        }`}
                    >
                        {hasCashedOut ? 'CASHED OUT' : gamePhase === 'CRASHED' ? 'CRASHED' : 'CASHOUT'}
                    </button>
                )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Crash;
