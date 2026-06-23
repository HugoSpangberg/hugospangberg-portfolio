import type { SayHiState } from './sayHiTypes';

export type SayHiEvent =
  | { type: 'SEND'; requestId: string }
  | { type: 'ACCEPT'; requestId: string; cooldownSeconds: number; now: Date }
  | { type: 'COOLDOWN'; retryAfterSeconds: number }
  | { type: 'UNAVAILABLE' }
  | { type: 'FAIL'; message: string }
  | { type: 'RESET' };

const canSend = (state: SayHiState) =>
  state.status === 'idle' || state.status === 'error' || state.status === 'unavailable';

export function transitionSayHiState(state: SayHiState, event: SayHiEvent): SayHiState {
  switch (event.type) {
    case 'SEND':
      return canSend(state) ? { status: 'sending', requestId: event.requestId } : state;
    case 'ACCEPT': {
      if (state.status !== 'sending') {
        return state;
      }

      const cooldownUntil = new Date(
        event.now.getTime() + event.cooldownSeconds * 1000,
      ).toISOString();

      return { status: 'success', requestId: event.requestId, cooldownUntil };
    }
    case 'COOLDOWN':
      return { status: 'cooldown', retryAfterSeconds: event.retryAfterSeconds };
    case 'UNAVAILABLE':
      return { status: 'unavailable' };
    case 'FAIL':
      return { status: 'error', message: event.message };
    case 'RESET':
      return { status: 'idle' };
    default:
      return state;
  }
}

export function getSayHiVisualStatus(state: SayHiState): SayHiState['status'] {
  return state.status;
}
