import { useEffect, useState } from 'react';
import About from './components/About';
import BuiltWith from './components/BuiltWith';
import Contact from './components/Contact';
import Education from './components/Education';
import Experience from './components/Experience';
import Footer from './components/Footer';
import Labs from './components/Labs';
import Navbar from './components/Navbar';
import ProfileHeroSection from './components/ProfileHeroSection';
import Skills from './components/Skills';
import SystemThinking from './components/SystemThinking';
import WorldIntroSection from './components/world/WorldIntroSection';
import { PortfolioContentProvider, usePortfolioContent } from './cms';
import type { Locale } from './data/content';
import AdminApp from './features/admin/AdminApp';
import { SayHiSection } from './features/say-hi';

const defaultLocale: Locale = 'sv';
const storageKey = 'hugo-portfolio-locale';

function getInitialLocale(): Locale {
  const savedLocale = window.localStorage.getItem(storageKey);

  if (savedLocale === 'sv' || savedLocale === 'en') {
    return savedLocale;
  }

  return defaultLocale;
}

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  return <PublicApp />;
}

function PublicApp() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  return (
    <PortfolioContentProvider locale={locale}>
      <PortfolioPage locale={locale} onLocaleChange={setLocale} />
    </PortfolioContentProvider>
  );
}

type PortfolioPageProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

function PortfolioPage({ locale, onLocaleChange }: PortfolioPageProps) {
  const { content: page } = usePortfolioContent();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = page.seo.title;

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (description) {
      description.content = page.seo.description;
    }

    window.localStorage.setItem(storageKey, locale);
  }, [locale, page.seo.description, page.seo.title]);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [locale]);

  return (
    <>
      <Navbar
        locale={locale}
        navItems={page.nav}
        onLocaleChange={onLocaleChange}
      />
      <main>
        <WorldIntroSection content={page.hero} locale={locale} />
        <ProfileHeroSection content={page.hero} />
        <About content={page.about} />
        <SystemThinking content={page.systemThinking} />
        <Skills content={page.skills} />
        <Experience content={page.experience} />
        <Education content={page.education} />
        <Labs content={page.labs} />
        <SayHiSection locale={locale} copy={page.sayHi} />
        <BuiltWith content={page.builtWith} />
        <Contact content={page.contact} />
      </main>
      <Footer content={page.footer} />
    </>
  );
}

export default App;
