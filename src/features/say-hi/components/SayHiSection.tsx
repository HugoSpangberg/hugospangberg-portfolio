import { Suspense, lazy } from 'react';
import type { Locale } from '../../../data/content';
import type { SayHiCopy, SayHiState } from '../model/sayHiTypes';
import { useSayHi } from '../hooks/useSayHi';
import type { LampVisualState } from './SayHiLampScene';
import SayHiPanel from './SayHiPanel';
import './say-hi.scss';

const SayHiLampScene = lazy(() => import('./SayHiLampScene'));

type SayHiSectionProps = {
  locale: Locale;
  copy: SayHiCopy;
};

function isSayHiEnabled() {
  return import.meta.env.VITE_SAY_HI_ENABLED !== 'false';
}

function getLampVisualState(state: SayHiState): LampVisualState {
  switch (state.status) {
    case 'idle':
      return 'idle';
    case 'armed':
      return 'localOn';
    case 'verifying':
    case 'sending':
      return 'sending';
    case 'success':
      return 'success';
    case 'cooldown':
      return 'cooldown';
    case 'error':
    case 'unavailable':
      return 'error';
    default:
      return 'idle';
  }
}

function SayHiSection({ locale, copy }: SayHiSectionProps) {
  const enabled = isSayHiEnabled();
  const sayHi = useSayHi({ locale });
  const lampVisualState = getLampVisualState(sayHi.state);

  return (
    <section className="say-hi-section section" id="say-hi" data-reveal>
      <Suspense
        fallback={
          <div className="say-hi-scene say-hi-scene--fallback" aria-hidden="true">
            <span>{copy.fallback}</span>
          </div>
        }
      >
        <SayHiLampScene
          copy={copy}
          state={lampVisualState}
          disabled={!enabled}
          onLampClick={sayHi.arm}
        />
      </Suspense>

      <div className="say-hi-overlay" aria-hidden="true" />

      <div className="container say-hi-content">
        <div className="say-hi-copy">
        <SayHiPanel
          copy={copy}
          state={sayHi.state}
          canSend={sayHi.canSend}
          isBusy={sayHi.isBusy}
          enabled={enabled}
          onArm={sayHi.arm}
          onSend={sayHi.send}
          onReset={sayHi.reset}
        />
        </div>

        <div ref={sayHi.turnstileRef} className="say-hi-section__turnstile" aria-hidden="true" />
      </div>
    </section>
  );
}

export default SayHiSection;
