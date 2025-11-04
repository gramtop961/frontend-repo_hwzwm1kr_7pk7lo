import React, { useEffect, useMemo, useRef, useState } from 'react';

// Utility random helpers
const rand = (min, max) => Math.random() * (max - min) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Flower palette and shapes (5-10 types)
const FLOWER_TYPES = [
  { id: 'daisy', petals: 12, petalColor: '#FFD6E0', center: '#FFC107', radius: 10 },
  { id: 'tulip', petals: 6, petalColor: '#FF6B6B', center: '#FFA000', radius: 12 },
  { id: 'lotus', petals: 10, petalColor: '#A78BFA', center: '#FDE68A', radius: 14 },
  { id: 'sunflower', petals: 16, petalColor: '#F59E0B', center: '#7C3E00', radius: 16 },
  { id: 'rose', petals: 8, petalColor: '#EF4444', center: '#86198F', radius: 12 },
  { id: 'peony', petals: 14, petalColor: '#F472B6', center: '#F59E0B', radius: 15 },
  { id: 'cherry', petals: 5, petalColor: '#FBCFE8', center: '#FCD34D', radius: 10 },
  { id: 'iris', petals: 7, petalColor: '#6366F1', center: '#A78BFA', radius: 13 },
  { id: 'bluebell', petals: 6, petalColor: '#3B82F6', center: '#93C5FD', radius: 10 },
  { id: 'lily', petals: 6, petalColor: '#FDE68A', center: '#F59E0B', radius: 13 },
];

// Audio: simple pluck using WebAudio
function usePluck(enabled) {
  const audioCtxRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, [enabled]);

  const play = (freq = 440) => {
    if (!enabled) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  };
  return play;
}

// Firefly entity
const createFirefly = (w, h) => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: rand(-0.3, 0.3),
  vy: rand(-0.2, 0.2),
  phase: Math.random() * Math.PI * 2,
});

const HiddenMessages = ({ unlocked }) => {
  const messages = [
    { id: 1, text: 'Among petals and starlight, your name glows softly.' },
    { id: 2, text: 'Every bloom is a heartbeat; every star, a promise.' },
    { id: 3, text: 'Tonight, the sky writes our story in silver.' },
    { id: 4, text: 'I found forever in the hush between firefly wings.' },
    { id: 5, text: 'You are the garden where my soul comes home.' },
  ];
  const shown = messages.slice(0, unlocked);
  if (!shown.length) return null;
  return (
    <div className="absolute left-4 bottom-4 space-y-1">
      {shown.map((m) => (
        <div key={m.id} className="text-white/90 text-xs md:text-sm bg-black/30 backdrop-blur rounded px-2 py-1 w-fit animate-fade-in">
          {m.text}
        </div>
      ))}
    </div>
  );
};

const WeatherOverlay = ({ weather }) => {
  // Render simple particles for rain/snow/wind
  const particles = Array.from({ length: 80 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {weather === 'rain' && particles.map(i => (
        <div key={i} className="absolute h-6 w-px bg-white/60 animate-[rain_1.2s_linear_infinite]" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random()}s`,
        }} />
      ))}
      {weather === 'snow' && particles.map(i => (
        <div key={i} className="absolute h-2 w-2 bg-white/80 rounded-full animate-[snow_6s_linear_infinite]" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 6}s`,
        }} />
      ))}
      {weather === 'wind' && particles.slice(0, 20).map(i => (
        <div key={i} className="absolute h-1 w-6 bg-white/20 rounded-full animate-pulse" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: 'rotate(10deg)'
        }} />
      ))}
    </div>
  );
};

const MagicGarden = ({ season = 'spring', weather = 'clear', audioOn = false, onAchievement, onRomanceReveal, refScreenshotState }) => {
  const containerRef = useRef(null);
  const [flowers, setFlowers] = useState([]); // {x,y,type,angle,ts}
  const [stars, setStars] = useState([]); // {x,y,ts}
  const [lines, setLines] = useState([]); // constellation lines [{a,b}]
  const [taps, setTaps] = useState(0);
  const [fireflies, setFireflies] = useState([]);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(0);

  const play = usePluck(audioOn);

  // Season palettes
  const palette = useMemo(() => {
    const p = {
      spring: { from: '#60a5fa', to: '#a78bfa', ground: '#16a34a' },
      summer: { from: '#22d3ee', to: '#6366f1', ground: '#059669' },
      autumn: { from: '#fb923c', to: '#9333ea', ground: '#b45309' },
      winter: { from: '#0ea5e9', to: '#4f46e5', ground: '#374151' },
    };
    return p[season] || p.spring;
  }, [season]);

  // Init fireflies
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const { clientWidth: w, clientHeight: h } = node;
    const list = Array.from({ length: 20 }, () => createFirefly(w, h));
    setFireflies(list);
  }, [season]);

  // Animate fireflies
  useEffect(() => {
    let raf;
    const tick = () => {
      setFireflies(prev => prev.map(ff => {
        let x = ff.x + ff.vx + Math.sin(ff.phase) * 0.2;
        let y = ff.y + ff.vy + Math.cos(ff.phase) * 0.1;
        let vx = ff.vx + rand(-0.05, 0.05);
        let vy = ff.vy + rand(-0.05, 0.05);
        const w = containerRef.current?.clientWidth || 800;
        const h = containerRef.current?.clientHeight || 600;
        if (x < 0) x = w; if (x > w) x = 0;
        if (y < 0) y = h; if (y > h) y = 0;
        return { ...ff, x, y, vx: Math.max(-0.6, Math.min(0.6, vx)), vy: Math.max(-0.4, Math.min(0.4, vy)), phase: ff.phase + 0.02 };
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Tap handler: bottom -> flower, top -> star
  const handleTap = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const h = rect.height;
    setTaps(t => t + 1);

    if (y > h * 0.6) {
      // Flower
      const type = choice(FLOWER_TYPES);
      const angle = rand(-5, 5);
      const f = { x, y, type: type.id, angle, ts: Date.now() };
      setFlowers(prev => [...prev, f]);
      play(rand(300, 600));
      if (flowers.length + 1 === 1) onAchievement && onAchievement('first_bloom');
      if (flowers.length + 1 === 10) onAchievement && onAchievement('florist');
    } else if (y < h * 0.4) {
      // Star
      const s = { x, y, ts: Date.now() };
      setStars(prev => {
        const next = [...prev, s];
        if (next.length >= 3 && lines.length === 0) {
          // First constellation
          onAchievement && onAchievement('constellationer');
        }
        return next;
      });
      play(rand(700, 1200));
      if (stars.length + 1 === 1) onAchievement && onAchievement('starlight');
    } else {
      // Middle area: random either
      Math.random() > 0.5 ? handleTap({ ...e, clientY: rect.top + h * 0.7 }) : handleTap({ ...e, clientY: rect.top + h * 0.2 });
      return;
    }

    // Unlock hidden messages progressively
    const thresholds = [3, 7, 12, 18, 25];
    const newlyUnlocked = thresholds.filter(t => t <= taps + 1).length;
    if (newlyUnlocked > hiddenUnlocked) {
      setHiddenUnlocked(newlyUnlocked);
      onAchievement && onAchievement('romantic');
      onRomanceReveal && onRomanceReveal(newlyUnlocked);
    }
  };

  // Build constellation lines from nearest neighbors
  useEffect(() => {
    if (stars.length < 3) return;
    const maxLines = Math.min(12, stars.length * 2);
    const pairs = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.hypot(dx, dy);
        pairs.push({ i, j, d });
      }
    }
    pairs.sort((a, b) => a.d - b.d);
    const chosen = [];
    const used = new Set();
    for (const p of pairs) {
      if (chosen.length >= maxLines) break;
      const key = `${p.i}-${p.j}`;
      if (!used.has(key) && p.d < 240) {
        chosen.push({ a: p.i, b: p.j });
        used.add(key);
      }
    }
    setLines(chosen);
  }, [stars]);

  // Expose state for screenshot via ref-like object
  useEffect(() => {
    if (!refScreenshotState) return;
    if (!refScreenshotState.current) refScreenshotState.current = {};
    refScreenshotState.current.getState = () => ({ flowers, stars, season, weather });
    refScreenshotState.current.palette = palette;
  }, [flowers, stars, season, weather, palette, refScreenshotState]);

  // Persist/Load helpers
  const saveToLocal = () => {
    const data = { flowers, stars, season, weather, hiddenUnlocked };
    localStorage.setItem('magic-garden', JSON.stringify(data));
  };
  const loadFromLocal = () => {
    const raw = localStorage.getItem('magic-garden');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setFlowers(data.flowers || []);
      setStars(data.stars || []);
      setHiddenUnlocked(data.hiddenUnlocked || 0);
    } catch {}
  };

  useEffect(() => {
    // Auto-load on mount
    const raw = localStorage.getItem('magic-garden');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setFlowers(data.flowers || []);
        setStars(data.stars || []);
        setHiddenUnlocked(data.hiddenUnlocked || 0);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose for parent controls
  MagicGarden.saveToLocal = saveToLocal;
  MagicGarden.loadFromLocal = loadFromLocal;

  // Ground gradient depends on weather too
  const bgOverlay = useMemo(() => {
    switch (weather) {
      case 'rain': return 'from-sky-500/80 to-indigo-700/90';
      case 'snow': return 'from-blue-400/70 to-violet-700/80';
      case 'wind': return 'from-teal-400/70 to-emerald-700/80';
      default: return 'from-sky-400/70 to-violet-700/80';
    }
  }, [weather]);

  return (
    <div className="relative w-full h-[70vh] min-h-[520px] rounded-2xl overflow-hidden shadow-xl select-none">
      <div
        ref={containerRef}
        onClick={handleTap}
        className={`absolute inset-0 cursor-crosshair bg-gradient-to-b ${bgOverlay}`}
        style={{ backgroundImage: `linear-gradient(to bottom, ${palette.from}, ${palette.to})` }}
      >
        {/* Stars */}
        {stars.map((s, idx) => (
          <div key={idx} className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.7)] animate-[twinkle_2s_ease_infinite]" style={{ left: s.x - 3, top: s.y - 3 }} />
        ))}
        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full">
          {lines.map((ln, i) => {
            const a = stars[ln.a];
            const b = stars[ln.b];
            if (!a || !b) return null;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c4b5fd" strokeWidth="1.5" strokeOpacity="0.8" />
          })}
        </svg>
        {/* Story text about constellation */}
        {stars.length >= 3 && (
          <div className="absolute top-4 right-4 text-right text-white/90 text-xs md:text-sm bg-black/30 backdrop-blur rounded px-2 py-1 max-w-xs">
            The stars whisper: two found each other across the sky, and every line between them is a path back home.
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: `linear-gradient(to top, ${palette.ground}, transparent)` }} />

        {/* Flowers */}
        {flowers.map((f, idx) => {
          const cfg = FLOWER_TYPES.find(t => t.id === f.type) || FLOWER_TYPES[0];
          const stemH = 40 + (containerRef.current?.clientHeight || 600) * 0.1 + Math.sin((Date.now() / 400 + idx) % (Math.PI * 2)) * 2;
          const size = cfg.radius * 2;
          return (
            <div key={idx} className="absolute" style={{ left: f.x - size / 2, top: f.y - size / 2 }}>
              {/* stem */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom" style={{ height: stemH, width: 2, background: '#166534', transform: `rotate(${f.angle}deg)` }} />
              {/* bloom */}
              <svg width={size} height={size} className="animate-[bloom_0.6s_ease-out]">
                {[...Array(cfg.petals)].map((_, p) => {
                  const angle = (p / cfg.petals) * Math.PI * 2;
                  const px = size/2 + Math.cos(angle) * cfg.radius;
                  const py = size/2 + Math.sin(angle) * cfg.radius;
                  return <circle key={p} cx={px} cy={py} r={cfg.radius/2} fill={cfg.petalColor} opacity="0.9" />
                })}
                <circle cx={size/2} cy={size/2} r={cfg.radius/1.8} fill={cfg.center} />
              </svg>
            </div>
          );
        })}

        {/* Fireflies */}
        {fireflies.map((ff, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: ff.x,
            top: ff.y,
            width: 6,
            height: 6,
            background: 'radial-gradient(circle, rgba(190,255,120,1) 0%, rgba(120,255,190,0.7) 60%, rgba(0,0,0,0) 70%)',
            filter: 'drop-shadow(0 0 6px rgba(190,255,120,0.8))',
          }} />
        ))}

        {/* Weather overlay */}
        <WeatherOverlay weather={weather} />

        {/* Hidden romantic messages */}
        <HiddenMessages unlocked={hiddenUnlocked} />
      </div>
    </div>
  );
};

export default MagicGarden;
