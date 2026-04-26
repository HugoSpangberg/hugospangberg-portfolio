import { careerMapItems } from '../hero/careerMap';
import type { CareerWorldLocation } from './careerLocations';

type WorldFallbackProps = {
  label: string;
  locations?: CareerWorldLocation[];
  onSelectLocation?: (location: CareerWorldLocation) => void;
};

function scrollToSection(targetSection: string) {
  document.getElementById(targetSection)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function WorldFallback({ label, locations, onSelectLocation }: WorldFallbackProps) {
  return (
    <div className="world-scene world-scene--fallback" aria-label={label}>
      <div className="world-scene__fallback-visual" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <nav className="world-nav" aria-label="Career world navigation">
        {careerMapItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const location = locations?.find((locationItem) => locationItem.id === item.id);

              if (location && onSelectLocation) {
                onSelectLocation(location);
                return;
              }

              scrollToSection(item.targetSection);
            }}
          >
            {locations?.find((location) => location.id === item.id)?.label ?? item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default WorldFallback;
