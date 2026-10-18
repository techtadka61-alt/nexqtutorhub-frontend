"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { MobileInput } from "@/components/ui/MobileInput";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { notify } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api-client";
import { contactApi } from "@/lib/api/contact";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { emailError, mobileError, nameError } from "@/lib/validation";

type Field = "name" | "email" | "mobileNumber" | "message";

const EMPTY = { name: "", email: "", mobileNumber: "", message: "", website: "" };

function validate(form: typeof EMPTY): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string | null>> = {
    name: nameError(form.name, "Your name"),
    email: emailError(form.email),
    mobileNumber: form.mobileNumber ? mobileError(form.mobileNumber) : null,
    message:
      form.message.trim().length < 10
        ? "Please write at least 10 characters."
        : form.message.length > 3000
          ? "Message must be at most 3000 characters."
          : null,
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as Partial<Record<Field, string>>;
}

/** Sends the message to the support inbox via the API; the sender also gets an acknowledgement email. */
export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const errors = validate(form);
  const fieldError = (field: Field) => serverErrors[field] ?? (submitted ? errors[field] : undefined);

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setIsSending(true);
    try {
      const res = await contactApi.send({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber || undefined,
        message: form.message.trim(),
        website: form.website || undefined,
      });
      setSentMessage(res.message);
      notify.success(res.message);
      setForm(EMPTY);
      setSubmitted(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerErrors(err.fieldErrors);
        if (err.statusCode === 429) return notify.error("You've sent several messages already. Please wait a few minutes and try again.");
      }
      notify.error(err, "Couldn't send your message. Please try again or email us directly.");
    } finally {
      setIsSending(false);
    }
  }

  if (sentMessage) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-2xl text-success">✓</span>
        <h2 className="font-display text-xl font-bold text-brand-primary">Message sent</h2>
        <p className="max-w-sm text-sm text-text-secondary">{sentMessage} We&apos;ve also emailed you a confirmation.</p>
        <Button variant="outline" onClick={() => setSentMessage(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input label="Your name" required value={form.name} error={fieldError("name")} onChange={(e) => update("name", e.target.value)} />
      <Input
        label="Your email"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        error={fieldError("email")}
        onChange={(e) => update("email", e.target.value)}
      />
      <MobileInput
        label="Mobile number"
        optional
        value={form.mobileNumber}
        error={fieldError("mobileNumber")}
        onValueChange={(value) => update("mobileNumber", value)}
      />
      <Textarea
        label="Message"
        required
        rows={5}
        maxLength={3000}
        placeholder="How can we help?"
        value={form.message}
        error={fieldError("message")}
        onChange={(e) => update("message", e.target.value)}
      />
      {/* Honeypot: hidden from people and screen readers; bots that fill every field get silently dropped. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      <Button type="submit" size="lg" isLoading={isSending}>
        Send message
      </Button>
      <p className="text-xs text-text-secondary">
        Prefer email? Write to us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-secondary">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
