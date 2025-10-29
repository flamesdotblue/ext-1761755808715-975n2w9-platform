import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[60vh] w-full">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/QrI46EbSvyxcmozb/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black pointer-events-none" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-200 to-white">
            Real-time Sound Meter
          </h1>
          <p className="mt-4 text-zinc-200/90 text-base sm:text-lg">
            Visualize your microphone input with responsive level and spectrum displays. A modern, vibrant interface inspired by digital audio visualizers.
          </p>
        </div>
      </div>
    </section>
  );
}
