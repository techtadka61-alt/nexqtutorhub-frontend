"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api-client";
import { notify } from "@/components/ui/Toast";
import { tuitionRequestsApi, type OpenRequestQuery } from "@/lib/api/tuition-requests";
import { cn } from "@/lib/cn";
import { useCatalog } from "@/hooks/useCatalog";
import { NEARBY_RADIUS_KM } from "@/lib/geolocation";
import {
  APPLICATION_STATUS,
  formatRequestDate,
  REQUEST_MODE_LABEL,
  REQUEST_STATUS,
  requestLocation,
  requestSummary,
} from "@/lib/tuition-request";
import type { TutorTuitionRequestView } from "@/types/api";

const PAGE_SIZE = 10;

type Tab = "open" | "mine";

interface Filters {
  city: string;
  subject: string;
  tuitionMode: "" | "home" | "online";
}

function errorText(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

/** Verified tutors browse open student requests and apply; every tutor can follow their own applications. */
export function StudentRequestsBoard() {
  const [tab, setTab] = useState<Tab>("open");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary">Student requests</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Students within 10 km post what they need. Call them on the number shown, or apply so they can see your profile.
        </p>
      </div>
      <div role="tablist" className="flex gap-2 border-b border-border">
        {(
          [
            ["open", "Open requests"],
            ["mine", "My applications"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
              tab === value
                ? "border-brand-secondary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "open" ? <OpenRequests /> : <MyApplications />}
    </div>
  );
}

function OpenRequests() {
  const catalog = useCatalog();
  const [filters, setFilters] = useState<Filters>({ city: "", subject: "", tuitionMode: "" });
  const [items, setItems] = useState<TutorTuitionRequestView[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [notVerified, setNotVerified] = useState<string | null>(null);
  const [needsLocation, setNeedsLocation] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Only the newest search may write results, so a slow earlier response can't overwrite a newer one.
  const requestId = useRef(0);

  const search = useCallback(async (f: Filters, pageNumber: number, id = requestId.current) => {
    const params: OpenRequestQuery = {
      page: pageNumber,
      limit: PAGE_SIZE,
      city: f.city.trim() || undefined,
      subject: f.subject || undefined,
      tuitionMode: f.tuitionMode || undefined,
    };
    try {
      const res = await tuitionRequestsApi.listOpen(params);
      if (id !== requestId.current) return;
      setItems((prev) => (pageNumber === 1 ? res.items : [...(prev ?? []), ...res.items]));
      setTotal(res.pagination.total);
      setPage(pageNumber);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      if (err instanceof ApiError && err.statusCode === 403) setNotVerified(err.message);
      // 412: no saved location, so the server can't apply the distance rule.
      else if (err instanceof ApiError && err.statusCode === 412) setNeedsLocation(err.message);
      else setError(errorText(err, "Failed to load requests."));
      setItems((prev) => prev ?? []);
    }
  }, []);

  // Debounced, so typing a city searches once the tutor pauses rather than on every keystroke.
  useEffect(() => {
    const id = ++requestId.current;
    const timer = setTimeout(() => void search(filters, 1, id), 350);
    return () => clearTimeout(timer);
  }, [filters, search]);

  function replace(updated: TutorTuitionRequestView) {
    setItems((prev) => prev?.map((item) => (item._id === updated._id ? updated : item)) ?? null);
  }

  if (notVerified) {
    return (
      <Card>
        <CardBody className="flex flex-col items-start gap-3">
          <Badge variant="warning">Verification pending</Badge>
          <h2 className="text-base font-semibold text-text-primary">You&apos;ll see student requests once you&apos;re verified</h2>
          <p className="text-sm text-text-secondary">
            Our team verifies tutors after reviewing their tuition application. If you haven&apos;t applied yet, do it now —
            approval unlocks this page.
          </p>
          <Button href="/for-tutors#apply" pill={false}>
            Apply for tuition
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (needsLocation) {
    return (
      <Card>
        <CardBody className="flex flex-col items-start gap-3">
          <Badge variant="warning">Location needed</Badge>
          <h2 className="text-base font-semibold text-text-primary">Share your location to see student requests</h2>
          <p className="text-sm text-text-secondary">{needsLocation}</p>
          <Button href="/account/profile" pill={false}>
            Go to my profile
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-secondary">
        Showing home-tuition requests within {NEARBY_RADIUS_KM} km of your saved location, plus all online requests.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="City"
          placeholder="Any city"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
        />
        <Select
          label="Subject"
          placeholder="Any subject"
          options={catalog.subjects.map((value) => ({ value, label: value }))}
          value={filters.subject}
          onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}
        />
        <Select
          label="Mode"
          placeholder="Any mode"
          options={[
            { value: "home", label: "Home tuition" },
            { value: "online", label: "Online tuition" },
          ]}
          value={filters.tuitionMode}
          onChange={(e) => setFilters((prev) => ({ ...prev, tuitionMode: e.target.value as Filters["tuitionMode"] }))}
        />
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {items === null ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-secondary">
          No open requests match these filters right now. Try clearing the city or subject.
        </p>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            {total} open request{total === 1 ? "" : "s"}
          </p>
          <ul className="flex flex-col gap-4">
            {items.map((request) => (
              <li key={request._id}>
                <RequestCard request={request} onChange={replace} />
              </li>
            ))}
          </ul>
          {items.length < total && (
            <Button
              variant="outline"
              pill={false}
              className="self-center"
              isLoading={isLoadingMore}
              onClick={async () => {
                setIsLoadingMore(true);
                await search(filters, page + 1);
                setIsLoadingMore(false);
              }}
            >
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function RequestCard({
  request,
  onChange,
}: {
  request: TutorTuitionRequestView;
  onChange: (request: TutorTuitionRequestView) => void;
}) {
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mine = request.myApplication;
  // A withdrawn application can be sent again.
  const canApply = request.status === "open" && (!mine || mine.status === "withdrawn");

  async function apply() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await tuitionRequestsApi.apply(request._id, message.trim() || undefined);
      notify.success(res.message);
      onChange(res.item);
      setIsApplying(false);
    } catch (err) {
      notify.error(err, "Couldn't send your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <RequestHeader request={request} />
        <RequestFacts request={request} />
        {request.mobileNumber && <StudentContact mobileNumber={request.mobileNumber} />}
        <p className="text-xs text-text-secondary">
          Posted {formatRequestDate(request.createdAt)} ·{" "}
          {request.applicationCount
            ? `${request.applicationCount} tutor${request.applicationCount === 1 ? "" : "s"} applied`
            : "Be the first to apply"}
        </p>

        {error && <ErrorBox>{error}</ErrorBox>}

        {mine && mine.status !== "withdrawn" ? (
          <Badge variant={APPLICATION_STATUS[mine.status].variant} className="w-fit">
            {mine.status === "pending" ? "Applied — awaiting reply" : APPLICATION_STATUS[mine.status].label}
          </Badge>
        ) : isApplying ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label="Note to the student"
              optional
              placeholder="e.g. I have 5 years of experience teaching CBSE Class 10 maths and can come on weekday evenings."
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button pill={false} isLoading={isSubmitting} onClick={apply}>
                Send application
              </Button>
              <Button variant="ghost" pill={false} disabled={isSubmitting} onClick={() => setIsApplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          canApply && (
            <Button pill={false} className="w-full sm:w-fit" onClick={() => setIsApplying(true)}>
              Apply to teach
            </Button>
          )
        )}
      </CardBody>
    </Card>
  );
}

function MyApplications() {
  const [items, setItems] = useState<TutorTuitionRequestView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    tuitionRequestsApi
      .listMyApplications()
      .then((res) => setItems(res.items))
      .catch((err) => {
        setItems((prev) => prev ?? []);
        setError(errorText(err, "Failed to load your applications."));
      });
  }, []);

  useEffect(load, [load]);

  async function withdraw(applicationId: string) {
    if (!window.confirm("Withdraw this application?")) return;
    setBusy(applicationId);
    setError(null);
    try {
      await tuitionRequestsApi.withdraw(applicationId);
      load();
    } catch (err) {
      setError(errorText(err, "Couldn't withdraw. Please try again."));
    } finally {
      setBusy(null);
    }
  }

  if (items === null) return <p className="text-sm text-text-secondary">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBox>{error}</ErrorBox>}
      {items.length === 0 && !error && (
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-secondary">
          You haven&apos;t applied to any student requests yet.
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {items.map((request) => {
          const mine = request.myApplication!;
          const status = APPLICATION_STATUS[mine.status];
          return (
            <li key={mine._id}>
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <RequestHeader request={request} />
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <RequestFacts request={request} />
                  <p className="text-xs text-text-secondary">Applied {formatRequestDate(mine.createdAt)}</p>

                  {request.contact && (
                    <div className="flex flex-col gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm">
                      <span className="font-semibold text-text-primary">
                        {request.contact.fullName} accepted you — get in touch
                      </span>
                      <a
                        href={`tel:${request.contact.mobileNumber}`}
                        className="font-semibold text-brand-secondary hover:text-brand-primary"
                      >
                        📞 {request.contact.mobileNumber}
                      </a>
                      {request.contact.email && (
                        <a
                          href={`mailto:${request.contact.email}`}
                          className="break-all font-semibold text-brand-secondary hover:text-brand-primary"
                        >
                          ✉️ {request.contact.email}
                        </a>
                      )}
                      {request.contact.fullAddress && <span className="text-text-primary">📍 {request.contact.fullAddress}</span>}
                    </div>
                  )}

                  {mine.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      className="w-fit"
                      isLoading={busy === mine._id}
                      onClick={() => withdraw(mine._id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RequestHeader({ request }: { request: TutorTuitionRequestView }) {
  return (
    <div className="min-w-0">
      <h2 className="font-semibold text-text-primary">{requestSummary(request)}</h2>
      <p className="mt-0.5 text-sm text-text-secondary">
        {request.studentFirstName} · {REQUEST_MODE_LABEL[request.tuitionMode]} · {requestLocation(request)}
        {request.distanceKm !== undefined && ` · ${request.distanceKm} km away`}
        {request.status !== "open" && ` · ${REQUEST_STATUS[request.status].label}`}
      </p>
    </div>
  );
}

function RequestFacts({ request }: { request: TutorTuitionRequestView }) {
  if (request.budget === undefined && !request.schedule && !request.notes) return null;
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {request.budget !== undefined && <Fact label="Budget" value={`₹${request.budget}/month`} />}
      {request.schedule && <Fact label="Timing" value={request.schedule} />}
      {request.notes && <Fact label="Notes" value={request.notes} className="sm:col-span-2" />}
    </dl>
  );
}

/** "+91 98765 43210", as a tap-to-call link. */
function StudentContact({ mobileNumber }: { mobileNumber: string }) {
  const digits = mobileNumber.replace(/\D/g, "").slice(-10);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-brand-secondary/30 bg-brand-secondary-light/40 px-4 py-3 text-sm">
      <span className="text-text-secondary">Contact the student</span>
      <a href={`tel:+91${digits}`} className="font-semibold text-brand-secondary hover:text-brand-primary">
        📞 +91 {digits.slice(0, 5)} {digits.slice(5)}
      </a>
    </div>
  );
}

function Fact({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
      {children}
    </div>
  );
}
