import { useEffect, useState } from 'react';
import type { Locale, NavItem } from '../data/content';
import LanguageToggle from './LanguageToggle';

type NavbarProps = {
  locale: Locale;
  navItems: NavItem[];
  onLocaleChange: (locale: Locale) => void;
};

function Navbar({ locale, navItems, onLocaleChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(navItems[0]?.href ?? '#start');
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigationLabel = locale === 'sv' ? 'Huvudnavigation' : 'Main navigation';
  const menuLabel = locale === 'sv' ? 'Öppna meny' : 'Open menu';
  const closeMenuLabel = locale === 'sv' ? 'Stäng meny' : 'Close menu';
  const brandLabel = locale === 'sv' ? 'Hugo Spångberg start' : 'Hugo Spångberg home';

  useEffect(() => {
    setIsOpen(false);
  }, [locale]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);

      const current = navItems
        .map((item) => ({
          href: item.href,
          element: document.querySelector<HTMLElement>(item.href),
        }))
        .filter((item): item is { href: string; element: HTMLElement } => Boolean(item.element))
        .reverse()
        .find((item) => item.element.offsetTop <= window.scrollY + 140);

      if (current) {
        setActiveSection(current.href);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="site-header">
      <span
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <nav className="navbar container" aria-label={navigationLabel}>
        <a className="navbar__brand" href="#start" aria-label={brandLabel}>
          <span className="navbar__mark" aria-hidden="true">
            HS
          </span>
          <span>Hugo Spångberg</span>
        </a>

        <button
          className="navbar__menu-button"
          type="button"
          aria-label={isOpen ? closeMenuLabel : menuLabel}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div
          className={`navbar__links${isOpen ? ' navbar__links--open' : ''}`}
          id="primary-navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeSection === item.href ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <LanguageToggle locale={locale} onLocaleChange={onLocaleChange} />
      </nav>
    </header>
  );
}

export default Navbar;
