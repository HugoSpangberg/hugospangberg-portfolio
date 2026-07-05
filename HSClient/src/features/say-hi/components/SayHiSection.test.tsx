import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { content } from '../../../data/content';
import SayHiSection from './SayHiSection';

vi.mock('./SayHiLampScene', () => ({
  default: ({ copy }: { copy: typeof content.sv.sayHi }) => (
    <div role="img" aria-label={copy.canvasLabel} data-testid="say-hi-lamp" />
  ),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function mockSayHiResponse(body: unknown, status = 200) {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

describe('SayHiSection', () => {
  it('renders when enabled and sends to the configured endpoint', async () => {
    vi.stubEnv('VITE_SAY_HI_ENABLED', 'true');
    vi.stubEnv(
      'VITE_SAY_HI_ENDPOINT',
      'https://worker.example.com/api/v1/greetings',
    );
    const fetcher = mockSayHiResponse({
      status: 'accepted',
      requestId: 'request-1',
      cooldownSeconds: 120,
    });

    render(<SayHiSection locale="sv" copy={content.sv.sayHi} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Klicka på lampan och säg hej' }),
    );

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(
        'https://worker.example.com/api/v1/greetings',
        expect.objectContaining({
          method: 'POST',
          headers: { 'content-type': 'application/json' },
        }),
      );
    });
    expect(
      await screen.findByText('Tack! Nu plingade det till hos mig.'),
    ).toBeInTheDocument();
  });

  it('shows cooldown feedback from the backend', async () => {
    vi.stubEnv('VITE_SAY_HI_ENABLED', 'true');
    mockSayHiResponse(
      {
        status: 'cooldown',
        requestId: 'request-1',
        retryAfterSeconds: 60,
      },
      429,
    );

    render(<SayHiSection locale="sv" copy={content.sv.sayHi} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Klicka på lampan och säg hej' }),
    );

    expect(
      await screen.findByText('Lampan behöver vila lite innan nästa hej.'),
    ).toBeInTheDocument();
  });

  it('shows friendly unavailable feedback', async () => {
    vi.stubEnv('VITE_SAY_HI_ENABLED', 'true');
    mockSayHiResponse(
      {
        status: 'unavailable',
        requestId: 'request-1',
      },
      503,
    );

    render(<SayHiSection locale="en" copy={content.en.sayHi} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Click the lamp and say hi' }),
    );

    expect(
      await screen.findAllByText(
        'Could not send it right now. The lamp is being a bit shy.',
      ),
    ).toHaveLength(2);
  });

  it('does not send requests when disabled', async () => {
    vi.stubEnv('VITE_SAY_HI_ENABLED', 'false');
    const fetcher = mockSayHiResponse({
      status: 'accepted',
      requestId: 'request-1',
      cooldownSeconds: 120,
    });

    render(<SayHiSection locale="en" copy={content.en.sayHi} />);

    const button = screen.getByRole('button', {
      name: 'Click the lamp and say hi',
    });
    expect(button).toBeDisabled();
    await userEvent.click(button);

    expect(fetcher).not.toHaveBeenCalled();
  });
});
