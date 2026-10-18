/**
 * Client-side mirrors of the API's validation rules, for instant feedback. The API re-checks everything, so
 * these only need to agree with it, not be the last line of defence.
 */

/** Same shape the API accepts: something@domain.tld, no spaces, at most 254 characters. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

/** Indian mobile numbers: exactly 10 digits starting with 6-9, no +91 / 0 prefix. */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function isValidMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value);
}

/**
 * Keeps only what a 10-digit number can contain while the user types or pastes: digits, with a pasted
 * "+91" / "91" / "0" prefix dropped, capped at 10 digits.
 */
export function sanitizeMobile(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** Letters, spaces and . ' - only (the API rejects anything else in a name). */
const NAME_PATTERN = /^\p{L}[\p{L} .'-]*$/u;

export function isValidName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2 && name.length <= 100 && NAME_PATTERN.test(name);
}

export const VALIDATION_MESSAGES = {
  email: "Please enter a valid email address, e.g. name@example.com.",
  mobile: "Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
  name: "Please enter a valid name — letters and spaces only.",
};

/*
 * Field-level checks returning the message to show under the input, or null when valid. Wording matches the
 * API's validation messages, so client and server errors read the same.
 */

export function nameError(value: string, label = "Full name"): string | null {
  const name = value.trim();
  if (!name) return `${label} is required.`;
  if (name.length < 2) return `${label} must be at least 2 characters.`;
  if (name.length > 100) return `${label} must be at most 100 characters.`;
  if (!NAME_PATTERN.test(name)) return `${label} can only contain letters, spaces and . ' -`;
  return null;
}

export function emailError(value: string): string | null {
  if (!value.trim()) return "Email address is required.";
  return isValidEmail(value) ? null : "Please enter a valid email address, e.g. name@example.com.";
}

export function mobileError(value: string, label = "Mobile number"): string | null {
  if (!value) return `${label} is required.`;
  if (value.length !== 10) return `${label} must be exactly 10 digits.`;
  return isValidMobile(value) ? null : `${label} must start with 6, 7, 8 or 9.`;
}

export const PASSWORD_HINT = "At least 8 characters, with letters & numbers";

export function passwordError(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Password must include at least one letter and one number.";
  return null;
}

export function confirmPasswordError(password: string, confirm: string): string | null {
  if (!confirm) return "Please confirm your password.";
  return confirm === password ? null : "Passwords do not match.";
}
