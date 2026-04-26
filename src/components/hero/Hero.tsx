import { lazy, Suspense } from 'react';
import HeroContent from './HeroContent';
import HeroFallback from './HeroFallback';
import type { HeroContentData } from './types';

const HeroScene = lazy(() => import('./HeroScene'));

type HeroProps = {
  content: HeroContentData;
};

function Hero({ content }: HeroProps) {
  return (
    <section className="hero section" id="start" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <HeroContent content={content} />
        <Suspense fallback={<HeroFallback label={content.fallbackLabel} />}>
          <HeroScene
            label={content.sceneLabel}
            fallbackLabel={content.fallbackLabel}
          />
        </Suspense>
      </div>
    </section>
  );
}

export default Hero;
