import type { SayHiCopy, SayHiState } from '../model/sayHiTypes';
import SayHiStatus from './SayHiStatus';

type SayHiPanelProps = {
  copy: SayHiCopy;
  state: SayHiState;
  canSend: boolean;
  isBusy: boolean;
  enabled: boolean;
  onArm: () => void;
  onSend: () => void;
  onReset: () => void;
};

function SayHiPanel({
  copy,
  state,
  canSend,
  isBusy,
  enabled,
  onArm,
  onSend,
  onReset,
}: SayHiPanelProps) {
  const sendDisabled = !enabled || !canSend || isBusy;
  const showReset = state.status === 'error' || state.status === 'unavailable';

  return (
    <div className="say-hi-panel">
      <div>
        <p className="section-kicker">{copy.kicker}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="say-hi-panel__actions" aria-label={copy.panelTitle}>
        <button
          className="say-hi-switch"
          type="button"
          aria-pressed={state.status !== 'idle'}
          disabled={!enabled || isBusy}
          onClick={onArm}
        >
          <span aria-hidden="true" />
          {copy.activateLabel}
        </button>

        <button className="button button--primary" type="button" disabled={sendDisabled} onClick={onSend}>
          {copy.sendLabel}
        </button>

        {showReset ? (
          <button className="button button--ghost" type="button" onClick={onReset}>
            {copy.resetLabel}
          </button>
        ) : null}
      </div>

      <SayHiStatus state={enabled ? state : { status: 'unavailable' }} copy={copy} />

      {!enabled ? <p className="say-hi-panel__soon">{copy.comingSoon}</p> : null}

      <div className="say-hi-panel__system">
        <h3>{copy.systemTitle}</h3>
        <p>{copy.systemDescription}</p>
        <p>{copy.privacy}</p>
      </div>
    </div>
  );
}

export default SayHiPanel;
