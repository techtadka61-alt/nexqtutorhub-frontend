"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface CreatableMultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  /** Most values that can be picked (the API's limit). */
  max?: number;
  /** Shortest typed value that can be added as a new option. */
  minLength?: number;
  maxLength?: number;
}

type Item = { kind: "option" | "add"; value: string };

const lower = (text: string) => text.toLowerCase();

/**
 * A search box over `options` with the picked values shown as removable chips. Typing filters the list (debounced);
 * text that matches no option can be added as it is, so the user is never stuck when their choice isn't listed.
 */
export function CreatableMultiSelect({
  label,
  options,
  value,
  onChange,
  hint,
  required,
  placeholder = "Search or type",
  max = 10,
  minLength = 2,
  maxLength = 60,
}: CreatableMultiSelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const query = text.trim();
  const debouncedQuery = useDebouncedValue(query);
  const full = value.length >= max;

  /** The list for a search: unpicked options containing it, then "Add …" when it isn't an option already. */
  function itemsFor(search: string): Item[] {
    const needle = lower(search);
    const picked = new Set(value.map(lower));
    const matches = options.filter((option) => !picked.has(lower(option)) && lower(option).includes(needle));
    const known = picked.has(needle) || options.some((option) => lower(option) === needle);
    const items: Item[] = matches.map((option) => ({ kind: "option", value: option }));
    if (search.length >= minLength && !known) items.push({ kind: "add", value: search });
    return items;
  }

  // Rendered from the debounced text; Enter re-runs the search on the live text so it never acts on a stale list.
  const items = itemsFor(debouncedQuery);
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function pick(item: Item) {
    if (full) return;
    // A typed value that differs from an option only in case is stored as the option.
    const canonical = options.find((option) => lower(option) === lower(item.value)) ?? item.value;
    if (!value.some((picked) => lower(picked) === lower(canonical))) onChange([...value, canonical]);
    setText("");
    setActive(0);
    // Closed after each pick so the list doesn't sit over the buttons below; typing or a click reopens it.
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(item: string) {
    onChange(value.filter((picked) => picked !== item));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + items.length) % Math.max(items.length, 1));
    } else if (e.key === "Enter") {
      // Never submit the surrounding form from here.
      e.preventDefault();
      const live = debouncedQuery === query ? items : itemsFor(query);
      const item = live[debouncedQuery === query ? activeIndex : 0];
      if (item && (open || query)) pick(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const showList = open && !full;

  return (
    <div
      className="flex flex-col gap-1.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <div
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
          className={cn(
            "flex min-h-13 w-full cursor-text flex-wrap items-center gap-2 rounded-xl border bg-surface px-3 py-2 transition-colors",
            showList ? "border-brand-secondary ring-2 ring-brand-secondary/30" : "border-border",
          )}
        >
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-brand-secondary-light py-1 pl-3 pr-1.5 text-sm font-medium text-brand-primary"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item);
                }}
                aria-label={`Remove ${item}`}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-brand-primary/10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && items.length ? `${id}-item-${activeIndex}` : undefined}
            autoComplete="off"
            maxLength={maxLength}
            disabled={full}
            placeholder={full ? `Maximum ${max} added` : value.length ? "Add another" : placeholder}
            value={text}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="h-9 min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-text-primary outline-none placeholder:text-text-secondary/70 disabled:cursor-not-allowed"
          />
        </div>

        {showList && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-soft"
          >
            {items.length ? (
              items.map((item, index) => (
                <li
                  key={`${item.kind}-${item.value}`}
                  id={`${id}-item-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  // mousedown, not click: keeps focus in the input so the list doesn't close first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(item);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "cursor-pointer px-4 py-2.5 text-sm text-text-primary",
                    index === activeIndex && "bg-brand-secondary-light/70",
                  )}
                >
                  {item.kind === "add" ? (
                    <span className="flex items-center gap-2 font-medium text-brand-primary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                      Add &ldquo;{item.value}&rdquo;
                    </span>
                  ) : (
                    item.value
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-2.5 text-sm text-text-secondary">
                {query ? "No match" : "Everything is already added"}
              </li>
            )}
          </ul>
        )}
      </div>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
