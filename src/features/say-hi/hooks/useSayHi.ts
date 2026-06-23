import { useEffect, useReducer, useRef } from 'react';
import type { Locale } from '../../../data/content';
import { createSayHiRequest, sendSayHi } from '../api/sayHiClient';
import { transitionSayHiState } from '../model/sayHiState';
import type { SayHiState } from '../model/sayHiTypes';
import { getTurnstileToken } from './useTurnstileToken';

type UseSayHiOptions = {
  locale: Locale;
  endpoint?: string;
};

const initialState: SayHiState = { status: 'idle' };

export function useSayHi({ locale, endpoint }: UseSayHiOptions) {
  const [state, dispatch] = useReducer(transitionSayHiState, initialState);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const isBusy = state.status === 'verifying' || state.status === 'sending';
  const canSend = state.status === 'armed';

  useEffect(() => {
    if (state.status !== 'success') {
      return undefined;
    }

    const cooldownUntil = new Date(state.cooldownUntil).getTime();
    const successDelay = 2_200;
    const timer = window.setTimeout(() => {
      const retryAfterSeconds = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
      dispatch({ type: 'COOLDOWN', retryAfterSeconds });
    }, successDelay);

    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state.status !== 'cooldown') {
      return undefined;
    }

    const timer = window.setTimeout(() => dispatch({ type: 'RESET' }), state.retryAfterSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [state]);

  const arm = () => dispatch({ type: 'ARM' });
  const reset = () => dispatch({ type: 'RESET' });

  const send = async () => {
    if (!turnstileRef.current || state.status !== 'armed') {
      return;
    }

    dispatch({ type: 'VERIFY' });

    try {
      const turnstileToken = await getTurnstileToken(turnstileRef.current);
      const request = createSayHiRequest(locale, turnstileToken);
      dispatch({ type: 'SEND', requestId: request.requestId });
      const response = await sendSayHi(request, { endpoint });

      if (response.status === 'accepted') {
        dispatch({
          type: 'ACCEPT',
          requestId: response.requestId,
          cooldownSeconds: response.cooldownSeconds,
          now: new Date(),
        });
        return;
      }

      if (response.status === 'cooldown') {
        dispatch({ type: 'COOLDOWN', retryAfterSeconds: response.retryAfterSeconds });
        return;
      }

      dispatch({ type: 'UNAVAILABLE' });
    } catch (error) {
      dispatch({
        type: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown say hi error.',
      });
    }
  };

  return {
    state,
    turnstileRef,
    canSend,
    isBusy,
    arm,
    reset,
    send,
  };
}
