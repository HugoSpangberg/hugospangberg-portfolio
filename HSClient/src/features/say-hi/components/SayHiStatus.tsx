import type { SayHiCopy, SayHiState } from '../model/sayHiTypes';

type SayHiStatusProps = {
  state: SayHiState;
  copy: SayHiCopy;
};

function getStatusText(state: SayHiState, copy: SayHiCopy) {
  if (state.status === 'cooldown') {
    return `${copy.statuses.cooldown} ${state.retryAfterSeconds}s`;
  }

  return copy.statuses[state.status];
}

function SayHiStatus({ state, copy }: SayHiStatusProps) {
  return (
    <p className={`say-hi-status say-hi-status--${state.status}`} role="status" aria-live="polite">
      {getStatusText(state, copy)}
    </p>
  );
}

export default SayHiStatus;
