import React from 'react';

const badgesCatalog = [
  { id: 'first_bloom', label: 'First Bloom', desc: 'You planted your first flower.' },
  { id: 'starlight', label: 'Starlight', desc: 'You placed your first star.' },
  { id: 'florist', label: 'Florist', desc: '10 flowers in your garden.' },
  { id: 'constellationer', label: 'Constellationer', desc: 'Connect the first constellation.' },
  { id: 'romantic', label: 'Romantic', desc: 'Unlocked a hidden message.' },
  { id: 'artisan', label: 'Artisan', desc: 'Saved a screenshot of your garden.' },
];

const AchievementsModal = ({ open, onClose, achievements }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-xl shadow-2xl w-[90vw] max-w-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Achievements & Badges</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Close</button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badgesCatalog.map(b => {
            const unlocked = !!achievements[b.id];
            return (
              <div key={b.id} className={`rounded-lg border p-4 transition ${unlocked ? 'border-emerald-400 bg-emerald-50/60' : 'border-zinc-200 bg-zinc-50/60 dark:bg-zinc-800/40'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${unlocked ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <p className="font-semibold">{b.label}</p>
                </div>
                <p className="text-sm mt-1 opacity-80">{b.desc}</p>
                {!unlocked && <p className="text-xs mt-2 italic opacity-60">Locked</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
