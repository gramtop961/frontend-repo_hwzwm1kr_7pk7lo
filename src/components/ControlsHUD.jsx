import React from 'react';

const ControlsHUD = ({ onSave, onLoad, onClear, onScreenshot, onToggleAudio, audioOn, weather, setWeather, season, setSeason, onShowAchievements }) => {
  const weathers = ['clear', 'rain', 'snow', 'wind'];
  const seasons = ['spring', 'summer', 'autumn', 'winter'];

  return (
    <div className="sticky top-2 z-40 w-full">
      <div className="mx-auto w-fit rounded-full bg-white/70 backdrop-blur shadow-lg border border-white/60 px-4 py-2 flex items-center gap-2">
        <button onClick={onSave} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition">Save</button>
        <button onClick={onLoad} className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600 transition">Load</button>
        <button onClick={onClear} className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-sm hover:bg-rose-600 transition">Clear</button>
        <button onClick={onScreenshot} className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-sm hover:bg-violet-600 transition">Screenshot</button>
        <button onClick={onToggleAudio} className={`px-3 py-1.5 rounded-full text-sm transition ${audioOn ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}>{audioOn ? 'Sound On' : 'Sound Off'}</button>
        <div className="h-6 w-px bg-zinc-300 mx-1" />
        <label className="text-xs opacity-70">Weather</label>
        <select value={weather} onChange={e => setWeather(e.target.value)} className="text-sm bg-transparent px-2 py-1 rounded-md border border-zinc-300">
          {weathers.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <label className="text-xs opacity-70">Season</label>
        <select value={season} onChange={e => setSeason(e.target.value)} className="text-sm bg-transparent px-2 py-1 rounded-md border border-zinc-300">
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="h-6 w-px bg-zinc-300 mx-1" />
        <button onClick={onShowAchievements} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-sm hover:bg-zinc-800 transition">Badges</button>
      </div>
    </div>
  );
};

export default ControlsHUD;
