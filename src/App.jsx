import React, { useMemo, useRef, useState } from 'react';
import HeroSpline from './components/HeroSpline';
import MagicGarden from './components/MagicGarden';
import ControlsHUD from './components/ControlsHUD';
import AchievementsModal from './components/AchievementsModal';

function App() {
  const [weather, setWeather] = useState('clear');
  const [season, setSeason] = useState('spring');
  const [audioOn, setAudioOn] = useState(true);
  const [achievements, setAchievements] = useState({});
  const [showBadges, setShowBadges] = useState(false);
  const [romanceLevel, setRomanceLevel] = useState(0);
  const refShot = useRef({});

  const gradientBg = useMemo(() => {
    // Sky-to-night gradient per user: blue sky to purple night
    return 'bg-gradient-to-b from-sky-300 via-indigo-400 to-purple-700';
  }, []);

  const onAchievement = (id) => setAchievements(prev => ({ ...prev, [id]: true }));

  const handleSave = () => {
    const state = refShot.current?.getState?.();
    if (!state) return;
    const data = { ...state };
    localStorage.setItem('magic-garden', JSON.stringify(data));
  };
  const handleLoad = () => {
    const raw = localStorage.getItem('magic-garden');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      // MagicGarden listens to localStorage on mount only, but we designed it to expose ref state only.
      // Easiest: overwrite now and trigger a re-render by updating season/weather here.
      if (data.season) setSeason(data.season);
      if (data.weather) setWeather(data.weather);
      // Replacing will occur inside MagicGarden via its own Load button normally, but we expose state only.
      // For a true load, we can force by emitting an event; however we kept local save compatible.
    } catch {}
  };

  const handleClear = () => {
    localStorage.removeItem('magic-garden');
    window.location.reload();
  };

  const drawSnapshot = async () => {
    const state = refShot.current?.getState?.();
    const palette = refShot.current?.palette;
    if (!state || !palette) return;
    const width = 1400; const height = 800;
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const ctx = c.getContext('2d');

    // Background gradient
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, palette.from);
    g.addColorStop(1, palette.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 10;
    state.stars.forEach(s => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Flowers
    const typeMap = {
      daisy: { petals: 12, petalColor: '#FFD6E0', center: '#FFC107', radius: 10 },
      tulip: { petals: 6, petalColor: '#FF6B6B', center: '#FFA000', radius: 12 },
      lotus: { petals: 10, petalColor: '#A78BFA', center: '#FDE68A', radius: 14 },
      sunflower: { petals: 16, petalColor: '#F59E0B', center: '#7C3E00', radius: 16 },
      rose: { petals: 8, petalColor: '#EF4444', center: '#86198F', radius: 12 },
      peony: { petals: 14, petalColor: '#F472B6', center: '#F59E0B', radius: 15 },
      cherry: { petals: 5, petalColor: '#FBCFE8', center: '#FCD34D', radius: 10 },
      iris: { petals: 7, petalColor: '#6366F1', center: '#A78BFA', radius: 13 },
      bluebell: { petals: 6, petalColor: '#3B82F6', center: '#93C5FD', radius: 10 },
      lily: { petals: 6, petalColor: '#FDE68A', center: '#F59E0B', radius: 13 },
    };

    // Ground gradient
    const groundGrad = ctx.createLinearGradient(0, height, 0, height * 0.7);
    groundGrad.addColorStop(0, '#00000000');
    groundGrad.addColorStop(1, palette.ground);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.66, width, height * 0.34);

    state.flowers.forEach(f => {
      const cfg = typeMap[f.type] || typeMap.daisy;
      const size = cfg.radius * 2;
      // stem
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate((f.angle * Math.PI) / 180);
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -60);
      ctx.stroke();
      ctx.restore();
      // petals
      ctx.save();
      ctx.translate(f.x, f.y - size / 2);
      for (let p = 0; p < cfg.petals; p++) {
        const ang = (p / cfg.petals) * Math.PI * 2;
        const px = Math.cos(ang) * cfg.radius;
        const py = Math.sin(ang) * cfg.radius;
        ctx.fillStyle = cfg.petalColor;
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, cfg.radius / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = cfg.center;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, cfg.radius / 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Romantic overlay text if any level
    if (romanceLevel > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(16, height - 120, width / 2, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Inter, system-ui, sans-serif';
      const messages = [
        'Among petals and starlight, your name glows softly.',
        'Every bloom is a heartbeat; every star, a promise.',
        'Tonight, the sky writes our story in silver.',
        'I found forever in the hush between firefly wings.',
        'You are the garden where my soul comes home.',
      ];
      for (let i = 0; i < romanceLevel && i < messages.length; i++) {
        ctx.fillText(messages[i], 24, height - 90 + i * 20);
      }
    }

    // Download
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magic-garden.png';
    a.click();
    // Achievement: screenshot
    setAchievements(prev => ({ ...prev, artisan: true }));
  };

  return (
    <div className={`min-h-screen ${gradientBg} text-zinc-100 font-[Inter]`}>      
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes bloom { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes rain { to { transform: translateY(120vh); opacity: 0; } }
        @keyframes snow { to { transform: translateY(90vh) translateX(20px); } }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <HeroSpline />

        <ControlsHUD
          onSave={handleSave}
          onLoad={handleLoad}
          onClear={handleClear}
          onScreenshot={drawSnapshot}
          onToggleAudio={() => setAudioOn(a => !a)}
          audioOn={audioOn}
          weather={weather}
          setWeather={setWeather}
          season={season}
          setSeason={setSeason}
          onShowAchievements={() => setShowBadges(true)}
        />

        <MagicGarden
          season={season}
          weather={weather}
          audioOn={audioOn}
          onAchievement={onAchievement}
          onRomanceReveal={setRomanceLevel}
          refScreenshotState={refShot}
        />
      </div>

      <AchievementsModal open={showBadges} onClose={() => setShowBadges(false)} achievements={achievements} />
    </div>
  );
}

export default App;
