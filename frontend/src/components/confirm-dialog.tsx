import { Dialog } from "@base-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  label?: string;
  error?: string | null;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  isPending = false,
  label = "Are you sure?",
  error,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="dialog-popup">
          <Dialog.Title className="dialog-title">{label}</Dialog.Title>
          {error != null && <p className="form-error">{error}</p>}
          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Yes"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
