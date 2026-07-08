import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../data/content';
import type { HeroContentData } from '../hero/types';
import WorldInfoCard from './WorldInfoCard';
import WorldFallback from './WorldFallback';
import {
  getCareerWorldLocations,
  type CareerWorldLocation,
} from './careerLocations';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

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
  const [isWorldExpanded, setIsWorldExpanded] = useState(false);
  const cvAction = content.actions.find((action) => action.download);
  const contactAction = content.actions.find((action) => action.href === '#contact');

  useEffect(() => {
    setSelectedLocation(null);
    setIsWorldExpanded(false);
  }, [locale]);

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

  useEffect(() => {
    if (!isWorldExpanded) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isWorldExpanded]);

  const handleReadMore = () => {
    if (!selectedLocation) {
      return;
    }

    const target = document.getElementById(selectedLocation.targetId);
    setSelectedLocation(null);
    setIsWorldExpanded(false);

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    target.classList.add('section-highlight');
    window.setTimeout(() => target.classList.remove('section-highlight'), 1600);
  };

  return (
    <section
      className={isWorldExpanded ? 'world-intro is-world-expanded' : 'world-intro'}
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
          key={locale}
          label={content.sceneLabel}
          fallbackLabel={content.fallbackLabel}
          locale={locale}
          locations={locations}
          onSelectLocation={setSelectedLocation}
          isExpanded={isWorldExpanded}
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

      <aside className="world-intro__recruiter" aria-label={isSwedish ? 'Snabb sammanfattning' : 'Quick summary'}>
        <span>{content.title}</span>
        <strong>{content.role}</strong>
        <p>{content.proofPoints?.[0] ?? content.stack}</p>
        <div className="world-intro__recruiter-actions">
          <button type="button" onClick={scrollToProfile}>
            {isSwedish ? 'Se profil' : 'View profile'}
          </button>
          {cvAction ? (
            <a
              href={publicAssetUrl(cvAction.href)}
              download={cvAction.download}
              aria-label={isSwedish ? 'Ladda ner CV PDF' : 'Download CV PDF'}
            >
              {cvAction.label}
            </a>
          ) : null}
          {contactAction ? <a href={contactAction.href}>{contactAction.label}</a> : null}
        </div>
      </aside>

      <button
        className="world-intro__continue"
        type="button"
        onClick={scrollToProfile}
      >
        {isSwedish ? 'Fortsätt till presentation' : 'Continue to profile'}
      </button>

      <button
        className="world-intro__open-world"
        type="button"
        onClick={() => setIsWorldExpanded(true)}
      >
        {isSwedish ? 'Öppna världen' : 'Open world'}
      </button>

      {isWorldExpanded && (
        <button
          className="world-intro__close-world"
          type="button"
          aria-label={isSwedish ? 'Stäng' : 'Close'}
          onClick={() => setIsWorldExpanded(false)}
        >
          {isSwedish ? 'Stäng' : 'Close'}
        </button>
      )}

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
