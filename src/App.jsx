import { useEffect, useRef, useState } from 'react';
import HeroCover from './components/HeroCover';
import AudioControls from './components/AudioControls';
import LevelMeter from './components/LevelMeter';
import SpectrumVisualizer from './components/SpectrumVisualizer';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [gain, setGain] = useState(1);

  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const startAudio = async () => {
    setError('');
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }, video: false });
      mediaStreamRef.current = stream;

      const ctx = audioCtxRef.current;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const gainNode = ctx.createGain();
      gainNode.gain.value = gain;

      source.connect(gainNode);
      gainNode.connect(analyser);
      // Do not connect to destination to avoid feedback/echo

      sourceRef.current = source;
      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;

      setIsRunning(true);
    } catch (e) {
      console.error(e);
      setError('Microphone access denied or unavailable.');
      stopAudio();
    }
  };

  const stopAudio = () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch {}

    try {
      if (sourceRef.current) sourceRef.current.disconnect();
      if (gainNodeRef.current) gainNodeRef.current.disconnect();
      if (analyserRef.current) analyserRef.current.disconnect();
    } catch {}

    mediaStreamRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    gainNodeRef.current = null;

    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  const onGainChange = (val) => {
    setGain(val);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = val;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroCover />

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 -mt-24">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <AudioControls
              isRunning={isRunning}
              onStart={startAudio}
              onStop={stopAudio}
              gain={gain}
              onGainChange={onGainChange}
              error={error}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <LevelMeter analyser={analyserRef.current} isRunning={isRunning} />
              </div>
              <div className="lg:col-span-2">
                <SpectrumVisualizer analyser={analyserRef.current} isRunning={isRunning} />
              </div>
            </div>
          </div>
        </div>

        <footer className="py-10 text-center text-sm text-zinc-400">
          Built with Web Audio API · Mic stays local, no audio is uploaded
        </footer>
      </main>
    </div>
  );
}
