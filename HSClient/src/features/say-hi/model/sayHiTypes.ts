import type { Locale } from '../../../data/content';

export type SayHiVisualStatus =
  | 'idle'
  | 'hover'
  | 'sending'
  | 'success'
  | 'cooldown'
  | 'error'
  | 'unavailable';

export type SayHiState =
  | { status: 'idle' }
  | { status: 'sending'; requestId: string }
  | { status: 'success'; requestId: string; cooldownUntil: string; localOnly?: boolean }
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
  localOnly?: boolean;
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
  curiosity: string;
  buttonLabel: string;
  loadingLabel: string;
  cooldownLabel: string;
  cooldownHint: string;
  resetLabel: string;
  panelTitle: string;
  comingSoon: string;
  canvasLabel: string;
  fallback: string;
  successDialog: {
    title: string;
    body: string;
    localBody: string;
    privacy: string;
    technicalPrivacy: string;
    closeLabel: string;
  };
  errorDialog: {
    title: string;
    body: string;
    closeLabel: string;
  };
  statuses: Record<SayHiState['status'], string>;
};
