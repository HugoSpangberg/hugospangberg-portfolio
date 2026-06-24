import type { Locale } from '../../data/content';
import type { CareerWorldLocation } from './careerLocations';

type WorldInfoCardProps = {
  location: CareerWorldLocation;
  locale: Locale;
  onClose: () => void;
  onReadMore: () => void;
};

function WorldInfoCard({
  location,
  locale,
  onClose,
  onReadMore,
}: WorldInfoCardProps) {
  const isSwedish = locale === 'sv';

  return (
    <article className="world-info-card" aria-labelledby="world-info-title">
      <div className="world-info-card__header">
        <div>
          <h2 id="world-info-title">{location.label}</h2>
        </div>
        <button
          className="world-info-card__close"
          type="button"
          aria-label={isSwedish ? 'Stäng' : 'Close'}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="world-info-card__role">{location.role}</p>
      <p className="world-info-card__description">{location.summary}</p>
      <div className="world-info-card__actions">
        <button type="button" onClick={onReadMore}>
          {isSwedish ? 'Läs mer' : 'Read more'}
        </button>
      </div>
    </article>
  );
}

export default WorldInfoCard;
