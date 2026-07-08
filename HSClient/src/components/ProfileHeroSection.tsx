import type { HeroContentData } from './hero/types';
import { publicAssetUrl } from '../utils/publicAssetUrl';

type ProfileHeroSectionProps = {
  content: HeroContentData;
};

function ProfileHeroSection({ content }: ProfileHeroSectionProps) {
  return (
    <section className="profile-hero section" id="profile" aria-labelledby="profile-title">
      <div className="container profile-hero__inner" data-reveal>
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="profile-title">{content.title}</h1>
          <p className="profile-hero__role">{content.role}</p>
          <p className="profile-hero__subtitle">{content.subtitle}</p>
          <p className="profile-hero__tagline">{content.tagline}</p>
          <div className="hero__actions" aria-label={content.actionsLabel}>
            {content.actions.map((action) => (
              <a
                key={`${action.label}-${action.href}`}
                className={`button button--${action.variant}`}
                href={action.download ? publicAssetUrl(action.href) : action.href}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noreferrer' : undefined}
                download={action.download}
                aria-label={action.download ? `${action.label} PDF` : undefined}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
        <div className="profile-hero__status" aria-label={content.availability}>
          <span>{content.availability}</span>
          <strong>{content.stack}</strong>
          {content.proofPoints ? (
            <ul className="profile-hero__proof-list">
              {content.proofPoints.map((proofPoint) => (
                <li key={proofPoint}>{proofPoint}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ProfileHeroSection;
