import type { Locale } from '../../../data/content';

export type SayHiVisualStatus =
  | 'idle'
  | 'hover'
  | 'armed'
  | 'verifying'
  | 'sending'
  | 'success'
  | 'cooldown'
  | 'error'
  | 'unavailable';

export type SayHiState =
  | { status: 'idle' }
  | { status: 'armed' }
  | { status: 'verifying' }
  | { status: 'sending'; requestId: string }
  | { status: 'success'; requestId: string; cooldownUntil: string }
  | { status: 'cooldown'; retryAfterSeconds: number }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

export type SayHiApiRequest = {
  turnstileToken: string;
  locale: Locale;
  requestId: string;
};

export type SayHiAcceptedResponse = {
  status: 'accepted';
  requestId: string;
  cooldownSeconds: number;
};

export type SayHiCooldownResponse = {
  status: 'cooldown';
  requestId: string;
  retryAfterSeconds: number;
};

export type SayHiUnavailableResponse = {
  status: 'unavailable';
  requestId: string;
};

export type SayHiApiResponse =
  | SayHiAcceptedResponse
  | SayHiCooldownResponse
  | SayHiUnavailableResponse;

export type SayHiCopy = {
  kicker: string;
  title: string;
  description: string;
  activateLabel: string;
  sendLabel: string;
  resetLabel: string;
  panelTitle: string;
  systemTitle: string;
  systemDescription: string;
  privacy: string;
  comingSoon: string;
  canvasLabel: string;
  fallback: string;
  statuses: Record<Exclude<SayHiState['status'], 'armed'>, string> & {
    armed: string;
  };
};
