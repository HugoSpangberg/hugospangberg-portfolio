import { useEffect, useRef, useState } from 'react';
import type { LocalAiSection as LocalAiContent } from '../../../data/content';
import AiCoreScene from './AiCoreScene';
import './local-ai.scss';

type LocalAiSectionProps = {
  content: LocalAiContent;
};

function LocalAiSection({ content }: LocalAiSectionProps) {
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
      { rootMargin: '520px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="local-ai section"
      id="local-ai"
      aria-labelledby="local-ai-title"
      data-reveal
    >
      <div className="container local-ai__layout">
        <div className="local-ai__content">
          <p className="section-heading__kicker">{content.kicker}</p>
          <h2 id="local-ai-title">{content.title}</h2>
          <div className="rich-copy local-ai__copy">
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

        <AiCoreScene
          active={shouldLoadScene}
          sceneLabel={content.sceneLabel}
          loadingLabel={content.loadingLabel}
          fallbackLabel={content.fallbackLabel}
        />
      </div>

    </section>
  );
}

export default LocalAiSection;
