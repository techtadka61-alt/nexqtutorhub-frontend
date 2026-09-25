type ClassValue = string | number | null | boolean | undefined | ClassValue[];

function flatten(value: ClassValue, acc: string[]) {
  if (!value && value !== 0) return;
  if (Array.isArray(value)) {
    value.forEach((v) => flatten(v, acc));
    return;
  }
  acc.push(String(value));
}

/** Minimal `clsx`-style class joiner so we don't need an extra dependency. */
export function cn(...values: ClassValue[]): string {
  const acc: string[] = [];
  values.forEach((v) => flatten(v, acc));
  return acc.join(" ");
}
