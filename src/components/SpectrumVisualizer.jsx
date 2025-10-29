import { useEffect, useRef } from 'react';

export default function SpectrumVisualizer({ analyser, isRunning }) {
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

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = 'rgba(24,24,27,0.85)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1 * dpr;
      const gridRows = 4;
      for (let i = 1; i < gridRows; i++) {
        const y = (i * height) / gridRows;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyser && isRunning) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = Math.min(96, bufferLength);
        const step = Math.floor(bufferLength / barCount);

        const barWidth = (width - 20 * dpr) / barCount; // padding
        for (let i = 0; i < barCount; i++) {
          const idx = i * step;
          const v = dataArray[idx] / 255; // 0..1
          const magnitude = Math.pow(v, 1.2); // gamma for smoother look
          const barHeight = magnitude * (height * 0.9);
          const x = 10 * dpr + i * barWidth;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, 'rgba(248,113,113,1)');
          grad.addColorStop(1, 'rgba(153,27,27,1)');
          ctx.fillStyle = grad;

          const radius = 6 * dpr;
          roundRect(ctx, x + 1 * dpr, y, barWidth - 2 * dpr, barHeight, radius);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${14 * dpr}px Inter, ui-sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Spectrum will appear here', width / 2, height / 2);
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
        <h3 className="text-sm font-semibold text-zinc-200">Spectrum</h3>
        <span className="text-xs text-zinc-400">Frequency bands</span>
      </div>
      <div className="h-64 w-full">
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
