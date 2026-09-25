"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const SUPPORT_EMAIL = "support@nextutorhub.com";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "NexTutorHub visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input label="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="Your email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Textarea
        label="Message"
        required
        rows={5}
        placeholder="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button type="submit" size="lg">
        Send message
      </Button>
      <p className="text-xs text-text-secondary">
        This opens your email app addressed to {SUPPORT_EMAIL}. Prefer to write directly? Reach us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-secondary">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
