import { Mic, Square, Volume2 } from 'lucide-react';

export default function AudioControls({ isRunning, onStart, onStop, gain, onGainChange, error }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]' : 'bg-zinc-500'}`} />
          <span className="text-sm text-zinc-300">{isRunning ? 'Microphone active' : 'Microphone idle'}</span>
        </div>

        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button onClick={onStart} className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-medium transition">
              <Mic size={18} /> Start
            </button>
          ) : (
            <button onClick={onStop} className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 font-medium transition border border-white/10">
              <Square size={18} /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Volume2 size={18} className="text-zinc-400" />
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.05}
          value={gain}
          onChange={(e) => onGainChange(parseFloat(e.target.value))}
          className="w-full accent-red-500"
        />
        <span className="w-14 text-right tabular-nums text-sm text-zinc-300">{gain.toFixed(2)}x</span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
