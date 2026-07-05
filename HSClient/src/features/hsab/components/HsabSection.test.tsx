import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../../data/content';
import HsabSection from './HsabSection';
import HsabShowcaseCanvas from './HsabShowcaseCanvas';

describe('HSAB portfolio showcase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the Swedish recruiter-facing HSAB content', () => {
    render(<HsabSection content={content.sv.hsab} />);

    expect(
      screen.getByRole('heading', {
        name: 'HSAB – AI-agenter i en lokal arbetsmiljö',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pågående AI-projekt')).toBeInTheDocument();
    expect(screen.getByText('Phaser')).toBeInTheDocument();
    expect(screen.getByText('ASP.NET Core')).toBeInTheDocument();
    expect(screen.getByTestId('hsab-showcase-canvas')).toBeInTheDocument();
  });

  it('renders the English HSAB content', () => {
    render(<HsabSection content={content.en.hsab} />);

    expect(
      screen.getByRole('heading', {
        name: 'HSAB – AI Agents in a Local Workspace',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ongoing AI project')).toBeInTheDocument();
    expect(screen.getByText('GitHub Issues API')).toBeInTheDocument();
    expect(screen.getByText(/mock\/offline mode/i)).toBeInTheDocument();
    expect(screen.queryByText(/visual office workspace built/i)).not.toBeInTheDocument();
  });

  it('does not expose a public HSAB GitHub link', () => {
    render(<HsabSection content={content.en.hsab} />);

    const links = screen.queryAllByRole('link');

    expect(links).toHaveLength(0);
    expect(document.body.textContent).not.toContain('github.com');
    expect(document.body.textContent).not.toContain('open source');
  });

  it('renders showcase fallback without calling the GitHub office-state API', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <HsabShowcaseCanvas
        active
        sceneLabel={content.en.hsab.sceneLabel}
        loadingLabel={content.en.hsab.loadingLabel}
        fallbackLabel={content.en.hsab.fallbackLabel}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('hsab-showcase-canvas')).toHaveAttribute(
        'data-scene-status',
        'fallback',
      ),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not crash when reduced motion is requested', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });

    render(
      <HsabShowcaseCanvas
        active
        sceneLabel={content.en.hsab.sceneLabel}
        loadingLabel={content.en.hsab.loadingLabel}
        fallbackLabel={content.en.hsab.fallbackLabel}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('hsab-showcase-canvas')).toHaveAttribute(
        'data-scene-status',
        'fallback',
      ),
    );
  });
});
