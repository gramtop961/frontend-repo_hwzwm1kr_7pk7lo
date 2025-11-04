import React from 'react';
import Spline from '@splinetool/react-spline';

const HeroSpline = () => {
  return (
    <section className="relative w-full h-[50vh] min-h-[360px] rounded-2xl overflow-hidden shadow-lg">
      <Spline
        scene="https://prod.spline.design/iO74mq3KeYTXVmpB/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 flex flex-col items-start text-white">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
          Magic Garden
        </h1>
        <p className="mt-2 text-sm md:text-base opacity-90 max-w-xl">
          Tap the sky to reveal constellations. Tap the earth to grow blooming flowers. Let the fireflies guide you.
        </p>
      </div>
    </section>
  );
};

export default HeroSpline;
