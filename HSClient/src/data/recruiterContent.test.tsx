import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { content } from './content';
import LocalAiSection from '../features/local-ai/components/LocalAiSection';
import { careerMapItems } from '../components/hero/careerMap';

describe('recruiter-ready portfolio content', () => {
  it('contains Swedish and English Local AI content', () => {
    expect(content.sv.localAi.title).toBe('Lokal AI-station & personlig automation');
    expect(content.en.localAi.title).toBe('Home AI Station & Personal Automation');
    expect(content.sv.nav.some((item) => item.href === '#local-ai')).toBe(true);
    expect(content.en.nav.some((item) => item.href === '#local-ai')).toBe(true);
  });

  it('renders the Local AI section text and fallback scene shell', async () => {
    render(<LocalAiSection content={content.en.localAi} />);

    expect(
      screen.getByRole('heading', { name: 'Home AI Station & Personal Automation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Linux')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: content.en.localAi.fallbackLabel })).toBeInTheDocument();
  });

  it('exposes localized CV download links and no public Say Hi navigation', () => {
    expect(content.sv.hero.actions).toContainEqual(
      expect.objectContaining({
        label: 'Ladda ner CV',
        href: 'documents/Hugo-Spangberg-CV-2026.pdf',
        download: 'Hugo-Spangberg-CV-2026.pdf',
      }),
    );
    expect(content.en.hero.actions).toContainEqual(
      expect.objectContaining({
        label: 'Download CV',
        href: 'documents/Hugo-Spangberg-CV-2026.pdf',
        download: 'Hugo-Spangberg-CV-2026.pdf',
      }),
    );
    expect(content.sv.nav.some((item) => item.href === '#say-hi')).toBe(false);
    expect(content.en.nav.some((item) => item.href === '#say-hi')).toBe(false);
  });

  it('does not expose unfinished project placeholders', () => {
    const renderedContent = JSON.stringify(content);

    expect(renderedContent).not.toContain('under construction');
    expect(renderedContent).not.toContain('under uppbyggnad');
    expect(renderedContent).not.toContain('Coming later');
    expect(renderedContent).not.toContain('Läggs till senare');
    expect(renderedContent).not.toContain('IoT Dashboard');
    expect(renderedContent).not.toContain('Movie Explorer');
  });

  it('keeps hover images free of visible reference captions', () => {
    const hoverImages = careerMapItems
      .map((item) => item.hoverVisual)
      .filter((hoverVisual) => hoverVisual?.kind === 'image');

    expect(hoverImages.length).toBeGreaterThan(0);
    hoverImages.forEach((hoverVisual) => {
      if (hoverVisual?.kind !== 'image') {
        return;
      }

      expect('caption' in hoverVisual).toBe(false);
      expect(hoverVisual.alt.toLowerCase()).not.toContain('reference');
      expect(hoverVisual.alt.toLowerCase()).not.toContain('referens');
      expect(hoverVisual.src.startsWith('/')).toBe(false);
    });
  });
});
