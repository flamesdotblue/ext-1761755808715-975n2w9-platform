import { useEffect, useRef } from 'react';

export default function LevelMeter({ analyser, isRunning }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const timeData = new Float32Array(analyser ? analyser.fftSize : 2048);

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && isRunning) {
        analyser.getFloatTimeDomainData(timeData);
        let sumSquares = 0;
        let peak = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i];
          sumSquares += v * v;
          const a = Math.abs(v);
          if (a > peak) peak = a;
        }
        const rms = Math.sqrt(sumSquares / timeData.length);
        const clip = peak >= 0.99;

        const width = canvas.width;
        const height = canvas.height;

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, 'rgba(24,24,27,0.9)');
        bgGrad.addColorStop(1, 'rgba(24,24,27,0.6)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Bars
        const barWidth = Math.floor(width * 0.18);
        const gap = Math.floor(width * 0.08);
        const startX = Math.floor((width - (barWidth * 2 + gap)) / 2);

        const drawBar = (x, value, color1, color2) => {
          const clamped = Math.min(1, Math.max(0, value));
          const barHeight = clamped * (height - 8 * (window.devicePixelRatio || 1));
          const y = height - barHeight;
          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, color1);
          grad.addColorStop(1, color2);
          ctx.fillStyle = grad;
          const radius = 8 * (window.devicePixelRatio || 1);
          roundRect(ctx, x, y, barWidth, barHeight, radius);
          ctx.fill();
        };

        drawBar(startX, rms, '#fca5a5', '#ef4444');
        drawBar(startX + barWidth + gap, peak, '#fde68a', '#f59e0b');

        // Labels
        ctx.font = `${14 * (window.devicePixelRatio || 1)}px Inter, ui-sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.textAlign = 'center';
        ctx.fillText('RMS', startX + barWidth / 2, height - 8 * (window.devicePixelRatio || 1));
        ctx.fillText('PEAK', startX + barWidth + gap + barWidth / 2, height - 8 * (window.devicePixelRatio || 1));

        // Clip indicator
        if (clip) {
          ctx.fillStyle = 'rgba(239,68,68,0.9)';
          ctx.beginPath();
          ctx.arc(width - 16 * (window.devicePixelRatio || 1), 16 * (window.devicePixelRatio || 1), 6 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Idle background
        ctx.fillStyle = 'rgba(24,24,27,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${14 * (window.devicePixelRatio || 1)}px Inter, ui-sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Activate microphone to view levels', canvas.width / 2, canvas.height / 2);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [analyser, isRunning]);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Level Meter</h3>
        <span className="text-xs text-zinc-400">RMS & Peak</span>
      </div>
      <div className="h-40 w-full">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
