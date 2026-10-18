"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MobileInput } from "@/components/ui/MobileInput";
import { notify } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api/auth";
import { accountApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api-client";
import { confirmPasswordError, mobileError, PASSWORD_HINT, passwordError } from "@/lib/validation";
import { UserRole } from "@/types/api";

/** Sign-in email (read-only) and the account's mobile number, which is saved on its own. */
export function ContactDetailsCard() {
  const { user, refreshUser } = useAuth();
  const current = user?.mobileNumber ?? "";
  const [mobile, setMobile] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Keep the field in sync when the account reloads (e.g. after saving), unless the user is mid-edit.
  const [syncedFrom, setSyncedFrom] = useState(current);
  if (syncedFrom !== current) {
    setSyncedFrom(current);
    setMobile(current);
  }

  if (!user) return null;
  const changed = mobile !== current;

  async function save() {
    const problem = mobileError(mobile);
    if (problem) return setError(problem);
    setError(null);
    setIsSaving(true);
    try {
      const res = await accountApi.updateMobile(mobile);
      await refreshUser();
      notify.success(res.message, "Mobile number updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.fieldErrors.mobileNumber ?? err.message : "Couldn't update your number.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card id="contact" className="scroll-mt-6">
      <CardHeader>
        <h2 className="text-base font-semibold text-text-primary">Contact details</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Only shared with the {user.role === UserRole.TUTOR ? "student who accepts your application" : "tutor you accept"}.
        </p>
      </CardHeader>
      <CardBody className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Input label="Email address" value={user.email} disabled hint="Your sign-in email. Contact support to change it." />
          <Badge variant={user.isEmailVerified ? "success" : "warning"} className="w-fit">
            {user.isEmailVerified ? "Verified" : "Not verified"}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <MobileInput
            label="Mobile number"
            required
            placeholder="10-digit mobile number"
            value={mobile}
            onValueChange={(value) => {
              setMobile(value);
              setError(null);
            }}
            error={error ?? undefined}
          />
          {changed && (
            <div className="flex gap-2">
              <Button type="button" size="sm" pill={false} isLoading={isSaving} onClick={save}>
                Update number
              </Button>
              <Button type="button" size="sm" pill={false} variant="ghost" onClick={() => setMobile(current)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/** Change password. The API revokes the session on success, so the user is signed out to log in again. */
export function SecurityCard() {
  const { logout } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = {
      current: form.current ? undefined : "Please enter your current password.",
      next:
        passwordError(form.next) ??
        (form.next && form.next === form.current ? "Choose a password different from the current one." : undefined),
      confirm: confirmPasswordError(form.next, form.confirm) ?? undefined,
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setIsSaving(true);
    try {
      await authApi.changePassword(form.current, form.next);
      notify.success("Password changed. Please log in with your new password.");
      await logout();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) setErrors({ current: "Current password is incorrect." });
      else notify.error(err, "Couldn't change your password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card id="security" className="scroll-mt-6">
      <CardHeader>
        <h2 className="text-base font-semibold text-text-primary">Password &amp; security</h2>
        <p className="mt-0.5 text-sm text-text-secondary">You&apos;ll be signed out everywhere after changing it.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Current password"
            required
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => update("current", e.target.value)}
            error={errors.current}
          />
          <Input
            label="New password"
            required
            type="password"
            autoComplete="new-password"
            hint={errors.next ? undefined : PASSWORD_HINT}
            value={form.next}
            onChange={(e) => update("next", e.target.value)}
            error={errors.next}
          />
          <Input
            label="Confirm new password"
            required
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            error={errors.confirm}
          />
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline" pill={false} isLoading={isSaving}>
              Change password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
