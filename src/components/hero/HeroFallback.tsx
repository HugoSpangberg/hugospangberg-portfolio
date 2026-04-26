import { careerMapItems } from './careerMap';

type HeroFallbackProps = {
  label: string;
};

function scrollToSection(targetSection: string) {
  document.getElementById(targetSection)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function HeroFallback({ label }: HeroFallbackProps) {
  return (
    <div className="hero-demo hero-demo--fallback" aria-label={label}>
      <div className="hero-demo__fallback-world" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="hero-demo__caption">{label}</p>
      <nav className="career-links career-links--fallback" aria-label="Career map navigation">
        {careerMapItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.targetSection)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default HeroFallback;
