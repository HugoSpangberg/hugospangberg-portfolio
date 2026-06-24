import { useEffect, useId, useRef, useState } from 'react';
import type { SayHiCopy, SayHiState } from '../model/sayHiTypes';

type SayHiPanelProps = {
  copy: SayHiCopy;
  state: SayHiState;
  canSend: boolean;
  isBusy: boolean;
  enabled: boolean;
  onSend: () => void;
};

function SayHiPanel({
  copy,
  state,
  canSend,
  isBusy,
  enabled,
  onSend,
}: SayHiPanelProps) {
  const [dialogType, setDialogType] = useState<'success' | 'error' | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogTitleId = useId();
  const isCooldown = state.status === 'cooldown';
  const buttonDisabled = !enabled || !canSend || isBusy || isCooldown;
  const buttonLabel = isBusy
    ? copy.loadingLabel
    : isCooldown
      ? copy.cooldownLabel
      : copy.buttonLabel;
  const statusText = enabled
    ? state.status === 'cooldown'
      ? copy.cooldownHint
      : state.status === 'error' || state.status === 'unavailable'
        ? copy.statuses.error
        : state.status === 'sending'
          ? copy.statuses.sending
          : ''
    : copy.comingSoon;

  useEffect(() => {
    if (state.status === 'success') {
      setDialogType('success');
      return;
    }

    if (state.status === 'error' || state.status === 'unavailable') {
      setDialogType('error');
    }
  }, [state.status]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialogType) {
      return undefined;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleClose = () => {
      setDialogType(null);
      buttonRef.current?.focus();
    };

    dialog.addEventListener('close', handleClose);

    return () => dialog.removeEventListener('close', handleClose);
  }, [dialogType]);

  const dialogCopy = dialogType === 'success' ? copy.successDialog : copy.errorDialog;

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <div className="say-hi-panel">
      <div>
        <p className="section-kicker">{copy.kicker}</p>
        <h2>{copy.title}</h2>
        <p className="say-hi-panel__curiosity">{copy.curiosity}</p>
      </div>

      <div className="say-hi-panel__actions" aria-label={copy.panelTitle}>
        <button
          ref={buttonRef}
          className="say-hi-primary-button"
          type="button"
          disabled={buttonDisabled}
          onClick={onSend}
        >
          <span aria-hidden="true" />
          <span>{buttonLabel}</span>
        </button>
      </div>

      <p className="say-hi-inline-status" role="status" aria-live="polite">
        {statusText}
      </p>

      <dialog
        ref={dialogRef}
        className="say-hi-dialog"
        aria-labelledby={dialogTitleId}
        aria-modal="true"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeDialog();
          }
        }}
      >
        {dialogCopy ? (
          <div className="say-hi-dialog__inner">
            <h3 id={dialogTitleId}>{dialogCopy.title}</h3>
            <p>
              {dialogType === 'success' && state.status === 'success' && state.localOnly
                ? copy.successDialog.localBody
                : dialogCopy.body}
            </p>
            {dialogType === 'success' ? (
              <>
                <p>{copy.successDialog.privacy}</p>
                <p>{copy.successDialog.technicalPrivacy}</p>
              </>
            ) : null}

            <button className="button button--primary" type="button" onClick={closeDialog}>
              {dialogCopy.closeLabel}
            </button>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

export default SayHiPanel;
