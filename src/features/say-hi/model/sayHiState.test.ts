import { describe, expect, it } from 'vitest';
import { transitionSayHiState } from './sayHiState';
import type { SayHiState } from './sayHiTypes';

describe('transitionSayHiState', () => {
  it('allows the expected happy path', () => {
    let state: SayHiState = { status: 'idle' };
    state = transitionSayHiState(state, { type: 'SEND', requestId: 'request-1' });
    expect(state).toEqual({ status: 'sending', requestId: 'request-1' });

    state = transitionSayHiState(state, {
      type: 'ACCEPT',
      requestId: 'request-1',
      cooldownSeconds: 120,
      now: new Date('2026-06-23T10:00:00.000Z'),
    });

    expect(state).toEqual({
      status: 'success',
      requestId: 'request-1',
      cooldownUntil: '2026-06-23T10:02:00.000Z',
      localOnly: undefined,
    });
  });

  it('ignores send while a request is already in flight', () => {
    const state: SayHiState = { status: 'sending', requestId: 'request-1' };

    expect(transitionSayHiState(state, { type: 'SEND', requestId: 'request-2' })).toBe(state);
  });

  it('can enter cooldown, unavailable and error states explicitly', () => {
    expect(transitionSayHiState({ status: 'idle' }, { type: 'COOLDOWN', retryAfterSeconds: 90 })).toEqual({
      status: 'cooldown',
      retryAfterSeconds: 90,
    });
    expect(transitionSayHiState({ status: 'idle' }, { type: 'UNAVAILABLE' })).toEqual({
      status: 'unavailable',
    });
    expect(transitionSayHiState({ status: 'idle' }, { type: 'FAIL', message: 'No token' })).toEqual({
      status: 'error',
      message: 'No token',
    });
  });
});
