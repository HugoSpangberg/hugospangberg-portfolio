import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../data/content';
import type { HeroContentData } from '../hero/types';
import WorldInfoCard from './WorldInfoCard';
import WorldFallback from './WorldFallback';
import {
  getCareerWorldLocations,
  type CareerWorldLocation,
} from './careerLocations';

const CareerWorldScene = lazy(() => import('./CareerWorldScene'));

type WorldIntroSectionProps = {
  content: HeroContentData;
  locale: Locale;
};

function scrollToProfile() {
  document.getElementById('profile')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function WorldIntroSection({ content, locale }: WorldIntroSectionProps) {
  const isSwedish = locale === 'sv';
  const locations = useMemo(() => getCareerWorldLocations(locale), [locale]);
  const [selectedLocation, setSelectedLocation] =
    useState<CareerWorldLocation | null>(null);

  useEffect(() => {
    if (!selectedLocation) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLocation(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLocation]);

  const handleReadMore = () => {
    if (!selectedLocation) {
      return;
    }

    const target = document.getElementById(selectedLocation.targetId);
    setSelectedLocation(null);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('section-highlight');
    window.setTimeout(() => target.classList.remove('section-highlight'), 1600);
  };

  return (
    <section
      className="world-intro"
      id="start"
      aria-labelledby="world-intro-title"
    >
      <Suspense
        fallback={
          <WorldFallback
            label={content.fallbackLabel}
            locations={locations}
            onSelectLocation={setSelectedLocation}
          />
        }
      >
        <CareerWorldScene
          label={content.sceneLabel}
          fallbackLabel={content.fallbackLabel}
          locations={locations}
          onSelectLocation={setSelectedLocation}
        />
      </Suspense>

      <div className="world-intro__copy">
        <p id="world-intro-title">
          {isSwedish ? 'Interaktiv karriärvärld' : 'Interactive career world'}
        </p>
        <span>
          {isSwedish
            ? 'Rotera världen och klicka på platser för att utforska min erfarenhet.'
            : 'Rotate the world and click places to explore my experience.'}
        </span>
      </div>

      <button
        className="world-intro__continue"
        type="button"
        onClick={scrollToProfile}
      >
        {isSwedish ? 'Fortsätt till presentation' : 'Continue to profile'}
      </button>

      {selectedLocation && (
        <WorldInfoCard
          location={selectedLocation}
          locale={locale}
          onClose={() => setSelectedLocation(null)}
          onReadMore={handleReadMore}
        />
      )}
    </section>
  );
}

export default WorldIntroSection;
