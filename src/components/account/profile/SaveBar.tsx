import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface SaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  error?: string | null;
  onDiscard: () => void;
  submitLabel?: string;
  /** Allow saving with no edits (e.g. a guided first run that must be submitted). */
  alwaysEnabled?: boolean;
}

/** Sticky footer for a long profile form: unsaved-changes status, discard, and the submit button. */
export function SaveBar({ isDirty, isSaving, error, onDiscard, submitLabel = "Save changes", alwaysEnabled }: SaveBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-surface/95 px-5 py-3 shadow-lifted backdrop-blur sm:flex-row sm:items-center sm:justify-between",
        error ? "border-error/40" : "border-border",
      )}
    >
      <p role={error ? "alert" : "status"} className={cn("text-sm", error ? "text-error" : "text-text-secondary")}>
        {error ?? (isDirty ? "You have unsaved changes." : "All changes saved.")}
      </p>
      <div className="flex gap-2">
        {isDirty && (
          <Button type="button" variant="ghost" pill={false} onClick={onDiscard} disabled={isSaving}>
            Discard
          </Button>
        )}
        <Button type="submit" pill={false} isLoading={isSaving} disabled={!isDirty && !alwaysEnabled}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
