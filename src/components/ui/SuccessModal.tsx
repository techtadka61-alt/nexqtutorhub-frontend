"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Centered success dialog built on the native <dialog> (focus trap, Escape and backdrop come for free).
 * Escape and the OK button both call `onConfirm`, so the dialog always ends the same way.
 */
export function SuccessModal({
  open,
  title,
  description,
  confirmLabel = "OK",
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="success-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border bg-surface p-0 text-text-primary shadow-lifted backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-[modal-in_180ms_ease-out]"
    >
      <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-8 text-center sm:px-8">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h2 id="success-modal-title" className="font-display text-xl font-bold text-brand-primary">
            {title}
          </h2>
          {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
        </div>
        <Button type="button" size="lg" pill={false} fullWidth onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
