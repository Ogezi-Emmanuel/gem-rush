// Next, React
import { FC, useState } from 'react';
import pkg from '../../../package.json';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE
// Hook shims without modifying import declarations
const ReactHooks = require('react') as typeof import('react');
const { useRef, useEffect } = ReactHooks;

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-2 sm:py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px]">
          <button className="rounded-full bg-slate-900 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm text-slate-400">
            Casino
          </button>
          <button className="rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm text-slate-400">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-2 sm:px-4 py-2 sm:py-3">
        <div
          className="relative aspect-[9/16] w-full max-w-[92vw] sm:max-w-sm md:max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-slate-400">
            <span className="rounded-full bg-white/5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] sm:text-[10px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] sm:h-[calc(100%-30px)] flex-col items-center justify-start px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-6 sm:h-7 items-center justify-center border-t border-white/10 px-2 text-[9px] sm:text-[10px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};

// ✅ THIS IS THE ONLY PART YOU EDIT FOR THE JAM
// Replace this entire GameSandbox component with the one AI generates.
// Keep the name `GameSandbox` and the `FC` type.

const GameSandbox: FC = () => {
  // --- Game State ---
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  type Item = { id: number; x: number; y: number; type: 'GEM' | 'BOMB' | 'POWERUP' | 'BOSS'; emoji: string; scale: number; hp?: number; power?: 'FREEZE' | 'SHIELD' | 'DOUBLE' };
  const [items, setItems] = useState<Item[]>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number; emoji: string }>>([]);
  const [lives, setLives] = useState(3);
  const [shakeFrames, setShakeFrames] = useState(0);
  const [flashActive, setFlashActive] = useState(false);
  const [comboCountState, setComboCountState] = useState(0);
  const [comboProgress, setComboProgress] = useState(0);
  const [feverModeState, setFeverModeState] = useState(false);

  // --- Refs (Mutable state for Game Loop) ---
  const stateRef = useRef({
    score: 0,
    items: [] as Item[],
    lastSpawn: 0,
    gameActive: false,
    speedMultiplier: 1,
    frameCount: 0,
    lives: 3,
    lastTap: 0,
    comboCount: 0,
    comboMultiplier: 1,
    comboExpiry: 0,
    feverActive: false,
    feverExpiry: 0,
    freezeExpiry: 0,
    doubleExpiry: 0,
    shieldActive: false,
    particles: [] as Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number; emoji: string }>,
    shakeFrames: 0,
  });
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Configuration ---
  const SPAWN_RATE = 800; 
  const GRAVITY = 0.5;
  const MAX_COMBO_WINDOW = 600; // ms
  const FEVER_THRESHOLD = 10;
  const FEVER_DURATION = 8000; // ms
  const FREEZE_DURATION = 5000; // ms
  const DOUBLE_DURATION = 5000; // ms
  const PARTICLE_LIFE = 500; // ms

  const TYPES = [
    { type: 'GEM' as const, emoji: '💎', val: 10 },
    { type: 'GEM' as const, emoji: '🪙', val: 20 },
    { type: 'GEM' as const, emoji: '🌟', val: 50 },
    { type: 'BOMB' as const, emoji: '💣', val: 0 },
    { type: 'BOMB' as const, emoji: '💥', val: 0 },
  ];
  const POWERUPS: Array<{ power: 'FREEZE' | 'SHIELD' | 'DOUBLE'; emoji: string }> = [
    { power: 'FREEZE', emoji: '❄️' },
    { power: 'SHIELD', emoji: '🛡️' },
    { power: 'DOUBLE', emoji: '✨' },
  ];

  // --- Engine ---
  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
    setItems([]);
    setParticles([]);
    setLives(3);
    setShakeFrames(0);
    setFlashActive(false);
    setComboCountState(0);
    setComboProgress(0);
    setFeverModeState(false);
    
    // Reset Ref State
    stateRef.current = {
      score: 0,
      items: [],
      lastSpawn: Date.now(),
      gameActive: true,
      speedMultiplier: 1,
      frameCount: 0,
      lives: 3,
      lastTap: 0,
      comboCount: 0,
      comboMultiplier: 1,
      comboExpiry: 0,
      feverActive: false,
      feverExpiry: 0,
      freezeExpiry: 0,
      doubleExpiry: 0,
      shieldActive: false,
      particles: [],
      shakeFrames: 0,
    };
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const stopGame = () => {
    stateRef.current.gameActive = false;
    setGameState('GAMEOVER');
    if (stateRef.current.score > highScore) setHighScore(stateRef.current.score);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const gameLoop = () => {
    if (!stateRef.current.gameActive) return;
 
    const now = Date.now();
    const ref = stateRef.current;
 
    // 1. Spawning Logic
    let currentRate = Math.max(300, SPAWN_RATE - (ref.score / 2));
    if (ref.freezeExpiry > now) currentRate += 300; // slower spawns when frozen
    if (now - ref.lastSpawn > currentRate) {
      const fever = ref.feverActive && ref.feverExpiry > now;
      const spawnPowerup = Math.random() < 0.05; // 5% chance
      let newItem: Item | null = null;
      if (spawnPowerup) {
        const pu = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        newItem = {
          id: now,
          x: Math.random() * 80 + 10,
          y: -10,
          type: 'POWERUP',
          emoji: pu.emoji,
          scale: 1,
          power: pu.power,
        };
      } else {
        const isBomb = !fever && Math.random() > 0.7; // reduce bombs during fever
        const typePool = TYPES.filter(t => isBomb ? t.type === 'BOMB' : t.type === 'GEM');
        const choice = typePool[Math.floor(Math.random() * typePool.length)];
        newItem = {
          id: now,
          x: Math.random() * 80 + 10,
          y: -10,
          type: choice.type,
          emoji: choice.emoji,
          scale: 1,
        };
      }
      if (newItem) ref.items.push(newItem);
      ref.lastSpawn = now;
      ref.speedMultiplier = 1 + (ref.score / 2000);
    }
 
    // 2. Physics Logic
    const effectiveGravity = GRAVITY * ref.speedMultiplier * (ref.freezeExpiry > now ? 0.4 : (ref.feverActive && ref.feverExpiry > now ? 1.2 : 1));
    ref.items.forEach(item => {
      item.y += effectiveGravity;
      if (item.emoji === '🌟') {
        item.scale = 1 + Math.sin(ref.frameCount * 0.1) * 0.2;
      }
    });
    // Particles physics
    ref.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 16; // approx per frame
    });
 
    // 3. Cleanup Logic (Remove items off screen)
    ref.items = ref.items.filter(item => item.y < 110);
    ref.particles = ref.particles.filter(p => p.life > 0);
    ref.frameCount++;
 
    // 4. Render Trigger
    if (ref.comboExpiry > now) {
      const remaining = Math.max(0, ref.comboExpiry - now);
      setComboProgress(remaining / MAX_COMBO_WINDOW);
    } else if (comboProgress !== 0) {
      setComboProgress(0);
    }
    const feverActiveNow = ref.feverActive && ref.feverExpiry > now;
    if (feverActiveNow !== feverModeState) setFeverModeState(feverActiveNow);
    if (ref.shakeFrames > 0) {
      ref.shakeFrames -= 1;
      setShakeFrames(ref.shakeFrames);
    }
    setItems([...ref.items]);
    setParticles([...ref.particles]);
 
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleTap = (id: number, type: 'GEM' | 'BOMB' | 'POWERUP' | 'BOSS', val: string, power?: 'FREEZE' | 'SHIELD' | 'DOUBLE') => {
    if (!stateRef.current.gameActive) return;
 
    // Remove item immediately
    stateRef.current.items = stateRef.current.items.filter(i => i.id !== id);
    setItems([...stateRef.current.items]);
 
    const now = Date.now();
    const ref = stateRef.current;
    if (type === 'BOMB') {
      if (ref.shieldActive) {
        ref.shieldActive = false; // consume shield
      } else {
        ref.lives = Math.max(0, ref.lives - 1);
        setLives(ref.lives);
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 150);
        ref.comboCount = 0;
        ref.comboMultiplier = 1;
        setComboCountState(0);
        ref.shakeFrames = 10;
        setShakeFrames(ref.shakeFrames);
        if (ref.lives <= 0) {
          stopGame();
          return;
        }
      }
    } else if (type === 'POWERUP') {
      if (power === 'FREEZE') {
        ref.freezeExpiry = now + FREEZE_DURATION;
      } else if (power === 'SHIELD') {
        ref.shieldActive = true;
      } else if (power === 'DOUBLE') {
        ref.doubleExpiry = now + DOUBLE_DURATION;
      }
    } else {
      const basePoints = TYPES.find(t => t.emoji === val)?.val || 10;
      if (now - ref.lastTap <= MAX_COMBO_WINDOW) {
        ref.comboCount += 1;
      } else {
        ref.comboCount = 1;
      }
      ref.lastTap = now;
      ref.comboExpiry = now + MAX_COMBO_WINDOW;
      ref.comboMultiplier = 1 + Math.floor(ref.comboCount / 3);
      setComboCountState(ref.comboCount);
      if (!ref.feverActive && ref.comboCount >= FEVER_THRESHOLD) {
        ref.feverActive = true;
        ref.feverExpiry = now + FEVER_DURATION;
      }
      const doubleActive = ref.doubleExpiry > now;
      const mult = ref.comboMultiplier * (doubleActive ? 2 : 1) * (ref.feverActive && ref.feverExpiry > now ? 1.5 : 1);
      const points = Math.floor(basePoints * mult);
      const newScore = ref.score + points;
      ref.score = newScore;
      setScore(newScore);
      const target = stateRef.current.items.find(i => i.id === id);
      const px = Math.min(95, Math.max(5, (target?.x ?? 50)));
      const py = Math.min(95, Math.max(5, (target?.y ?? 50)));
      for (let k = 0; k < 8; k++) {
        ref.particles.push({
          id: now + k,
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (-Math.random()) * 1.5,
          life: PARTICLE_LIFE,
          emoji: '✨',
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- Render ---
  return (
    <div className="flex justify-center items-center w-full py-4">
      <div ref={containerRef} className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] aspect-[9/16] w-auto max-w-full bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden select-none ring-1 ring-white/10 ring-offset-2 ring-offset-black" style={{ touchAction: 'manipulation', transform: shakeFrames > 0 ? `translate(${(Math.random()-0.5)*6}px, ${(Math.random()-0.5)*6}px)` : undefined }}>
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* Flash on damage */}
        {flashActive && <div className="absolute inset-0 bg-red-500/20 z-40" />}
        {/* Fever Glow */}
        {feverModeState && <div className="absolute inset-0 z-10 bg-gradient-to-tr from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />}

        {/* UI HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg ring-1 ring-white/5 flex items-center gap-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Best</p>
              <p className="text-xl font-mono text-purple-400 font-bold">{highScore}</p>
            </div>
            <div className="text-red-400 text-lg font-bold">❤️ x {lives}</div>
            {feverModeState && <div className="text-pink-400 text-sm font-black uppercase">Fever!</div>}
            {stateRef.current.shieldActive && <div className="text-sky-300 text-sm">🛡️</div>}
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700/60 text-right shadow-lg ring-1 ring-white/5 w-48">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Score</p>
            <p className="text-2xl font-mono text-green-400 font-black">{score}</p>
            {/* Combo bar */}
            {comboCountState > 1 && (
              <div className="mt-2 h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-500" style={{ width: `${Math.max(5, Math.min(100, comboProgress * 100))}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Game Layer */}
        <div className="absolute inset-0 z-20 overflow-hidden">
          {items.map(item => (
            <div
              key={item.id}
              onMouseDown={(e) => { e.stopPropagation(); handleTap(item.id, item.type, item.emoji, item.power); }}
              onTouchStart={(e) => { e.stopPropagation(); handleTap(item.id, item.type, item.emoji, item.power); }}
              className="absolute transform -translate-x-1/2 cursor-pointer hover:brightness-125 active:scale-95 transition-filter"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: 'clamp(2rem, 5vh, 3rem)',
                transform: `translate(-50%, 0) scale(${item.scale})`,
                filter: item.type === 'BOMB' ? 'drop-shadow(0 0 8px rgba(255,0,0,0.6))' : 'drop-shadow(0 0 8px rgba(255,255,255,0.4))'
              }}
            >
              {item.emoji}
            </div>
          ))}
          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} className="absolute -translate-x-1/2" style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: 'clamp(0.75rem, 2vh, 1rem)' }}>{p.emoji}</div>
          ))}
        </div>

        {/* Start Screen */}
        {gameState === 'START' && (
          <div className="absolute inset-0 z-40 bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 md:p-8 text-center">
            <div className="text-7xl md:text-8xl mb-4 animate-bounce">💎</div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">GEM RUSH</h1>
            <p className="text-slate-400 mb-8 text-sm">Tap the gems.<br/>Don&apos;t touch the bombs!</p>
            <button 
              onClick={startGame}
              className="w-3/4 max-w-xs sm:max-w-sm md:max-w-md px-12 py-5 md:px-14 md:py-6 text-xl md:text-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 text-white font-extrabold rounded-full shadow-xl shadow-pink-500/40 hover:shadow-2xl active:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300/60 ring-offset-2 ring-offset-black"
            >
              START GAME
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-8 text-center">
            <div className="text-6xl mb-2">💥</div>
            <h2 className="text-3xl font-black text-white uppercase italic mb-6">Wasted</h2>
            <div className="bg-black/30 p-4 rounded-xl w-full mb-8 border border-white/10">
              <p className="text-slate-300 text-xs uppercase tracking-widest mb-1">Final Score</p>
              <p className="text-5xl font-mono text-white font-bold">{score}</p>
            </div>
            <button 
              onClick={startGame}
              className="w-3/4 max-w-xs sm:max-w-sm md:max-w-md px-12 py-5 md:px-14 md:py-6 text-xl md:text-2xl bg-gradient-to-br from-red-500 via-orange-500 to-rose-500 text-white font-extrabold rounded-full shadow-xl shadow-red-500/40 hover:shadow-2xl active:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/60 ring-offset-2 ring-offset-black"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
