import type { HeroContentData } from './types';

type HeroContentProps = {
  content: HeroContentData;
};

function HeroContent({ content }: HeroContentProps) {
  return (
    <div className="hero__content" data-reveal>
      <p className="eyebrow">{content.eyebrow}</p>
      <h1 id="hero-title">{content.title}</h1>
      <p className="hero__role">{content.role}</p>
      <p className="hero__subtitle">{content.subtitle}</p>
      <p className="hero__tagline">{content.tagline}</p>
      <div className="hero__actions" aria-label={content.actionsLabel}>
        {content.actions.map((action) => (
          <a
            key={`${action.label}-${action.href}`}
            className={`button button--${action.variant}`}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noreferrer' : undefined}
          >
            {action.label}
          </a>
        ))}
      </div>
      <div className="hero__status-card" aria-label={content.availability}>
        <span>{content.availability}</span>
        <strong>{content.stack}</strong>
      </div>
    </div>
  );
}

export default HeroContent;
