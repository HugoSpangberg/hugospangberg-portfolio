import { useEffect, useRef, useState } from 'react';
import type { HsabSection as HsabContent } from '../../../data/content';
import HsabShowcaseCanvas from './HsabShowcaseCanvas';
import './hsab.scss';

type HsabSectionProps = {
  content: HsabContent;
};

function HsabSection({ content }: HsabSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadScene, setShouldLoadScene] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !('IntersectionObserver' in window)) {
      setShouldLoadScene(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadScene(true);
          observer.disconnect();
        }
      },
      { rootMargin: '180px 0px', threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hsab section"
      id="hsab"
      aria-labelledby="hsab-title"
      data-reveal
    >
      <div className="container hsab__layout">
        <div className="hsab__content">
          <p className="section-heading__kicker">{content.kicker}</p>
          <h2 id="hsab-title">{content.title}</h2>
          <p className="hsab__lead">{content.shortDescription}</p>
          <div className="rich-copy hsab__copy">
            {content.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="tag-list" aria-label={content.technologiesLabel}>
            {content.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        </div>

        <div className="hsab__scene-panel">
          <HsabShowcaseCanvas
            active={shouldLoadScene}
            sceneLabel={content.sceneLabel}
            loadingLabel={content.loadingLabel}
            fallbackLabel={content.fallbackLabel}
          />
        </div>
      </div>
    </section>
  );
}

export default HsabSection;
