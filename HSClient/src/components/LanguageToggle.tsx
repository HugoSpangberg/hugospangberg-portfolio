import type { Locale } from '../data/content';

type LanguageToggleProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

function LanguageToggle({ locale, onLocaleChange }: LanguageToggleProps) {
  const ariaLabel = locale === 'sv' ? 'Välj språk' : 'Choose language';

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label={ariaLabel}
    >
      {(['sv', 'en'] as const).map((option) => (
        <button
          key={option}
          className="language-toggle__button"
          type="button"
          aria-pressed={locale === option}
          aria-label={option === 'sv' ? 'Svenska' : 'English'}
          onClick={() => onLocaleChange(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default LanguageToggle;
