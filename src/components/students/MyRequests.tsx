"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api-client";
import { tuitionRequestsApi } from "@/lib/api/tuition-requests";
import { assetUrl } from "@/lib/config";
import {
  APPLICATION_STATUS,
  formatRequestDate,
  REQUEST_MODE_LABEL,
  REQUEST_STATUS,
  requestLocation,
  requestSummary,
} from "@/lib/tuition-request";
import type { TuitionRequest, TuitionRequestApplicant, TuitionRequestDetail } from "@/types/api";

/** Mirrors MAX_OPEN_REQUESTS_PER_STUDENT on the API, which is what actually enforces it. */
const MAX_OPEN_REQUESTS = 3;

function errorText(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

/** The student's tuition requests; `?id=` opens one with the tutors who applied. */
export function MyRequests() {
  const id = useSearchParams().get("id");
  return id ? <RequestDetail key={id} id={id} /> : <RequestList />;
}

function RequestList() {
  const router = useRouter();
  const [requests, setRequests] = useState<TuitionRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tuitionRequestsApi
      .listMine()
      .then((res) => setRequests(res.items))
      .catch((err) => {
        setRequests([]);
        setError(errorText(err, "Failed to load your requests."));
      });
  }, []);

  const openCount = requests?.filter((request) => request.status === "open").length ?? 0;
  const canPost = openCount < MAX_OPEN_REQUESTS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">My tuition requests</h1>
          <p className="mt-1 text-sm text-text-secondary">See which tutors applied and choose who to connect with.</p>
        </div>
        {canPost && (
          <Button href="/request-tutor" pill={false}>
            Post a new request
          </Button>
        )}
      </div>

      {!canPost && (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          You have {MAX_OPEN_REQUESTS} open requests — close one to post another.
        </p>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}

      {requests === null ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : requests.length === 0 && !error ? (
        <Card>
          <CardBody className="flex flex-col items-start gap-3">
            <h2 className="text-base font-semibold text-text-primary">No requests yet</h2>
            <p className="text-sm text-text-secondary">Tell us what you need and verified tutors will apply to you.</p>
            <Button href="/request-tutor" pill={false}>
              Find a tutor
            </Button>
          </CardBody>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => {
            const status = REQUEST_STATUS[request.status];
            const pending = request.pendingApplicationCount ?? 0;
            return (
              <li key={request._id}>
                <button
                  type="button"
                  onClick={() => router.push(`/my-requests?id=${request._id}`)}
                  className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-brand-secondary focus-ring sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-text-primary">{requestSummary(request)}</span>
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {REQUEST_MODE_LABEL[request.tuitionMode]} · {requestLocation(request)} · Posted{" "}
                    {formatRequestDate(request.createdAt)}
                  </span>
                  <span className="text-sm font-semibold text-brand-secondary">
                    {pending > 0
                      ? `${pending} tutor${pending === 1 ? "" : "s"} waiting for your reply →`
                      : request.status === "open"
                        ? "No new responses yet — view details →"
                        : "View details →"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RequestDetail({ id }: { id: string }) {
  const [request, setRequest] = useState<TuitionRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    tuitionRequestsApi
      .getMine(id)
      .then((res) => setRequest(res.item))
      .catch((err) => setError(errorText(err, "Failed to load this request.")));
  }, [id]);

  useEffect(load, [load]);

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      load();
    } catch (err) {
      setError(errorText(err, "Something went wrong. Please try again."));
    } finally {
      setBusy(null);
    }
  }

  function accept(applicant: TuitionRequestApplicant) {
    const name = applicant.tutor?.name ?? "this tutor";
    if (!window.confirm(`Accept ${name}? Your phone number will be shared with them, and other applications will be declined.`))
      return;
    void run(applicant._id, () => tuitionRequestsApi.accept(id, applicant._id));
  }

  function closeRequest() {
    if (!window.confirm("Close this request? Tutors won't be able to apply any more.")) return;
    void run("close", () => tuitionRequestsApi.close(id));
  }

  const back = (
    <Link href="/my-requests" className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary">
      ← All my requests
    </Link>
  );

  if (!request) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        {error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-text-secondary">Loading…</p>}
      </div>
    );
  }

  const status = REQUEST_STATUS[request.status];
  const isOpen = request.status === "open";
  const pending = request.applications.filter((applicant) => applicant.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      {back}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-brand-primary sm:text-2xl">{requestSummary(request)}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Posted {formatRequestDate(request.createdAt)}
                {!!request.notifiedTutorCount &&
                  ` · Sent to ${request.notifiedTutorCount} verified tutor${request.notifiedTutorCount === 1 ? "" : "s"} ${
                    request.tuitionMode === "online" ? "who teach these subjects online" : "near you"
                  }`}
              </p>
            </div>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Detail label="Mode" value={REQUEST_MODE_LABEL[request.tuitionMode]} />
            <Detail label="Location" value={requestLocation(request)} />
            {request.budget !== undefined && <Detail label="Budget" value={`₹${request.budget}/month`} />}
            {request.schedule && <Detail label="Timing" value={request.schedule} />}
            <Detail label="Your mobile (private)" value={request.mobileNumber} />
            {request.notes && <Detail label="Notes" value={request.notes} className="sm:col-span-2" />}
          </dl>
          {isOpen && (
            <Button variant="outline" size="sm" pill={false} className="w-fit" isLoading={busy === "close"} onClick={closeRequest}>
              Close request
            </Button>
          )}
        </CardBody>
      </Card>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Tutor responses {request.applications.length > 0 && `(${request.applications.length})`}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {isOpen
            ? pending.length
              ? "Accept a tutor to share contact details with each other."
              : "No tutors have applied yet. We'll email you when someone does."
            : request.status === "matched"
              ? "You've chosen a tutor. Their contact details are below."
              : "This request is closed."}
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {request.applications.map((applicant) => (
          <li key={applicant._id}>
            <ApplicantCard
              applicant={applicant}
              canRespond={isOpen && applicant.status === "pending"}
              busy={busy === applicant._id}
              onAccept={() => accept(applicant)}
              onDecline={() => void run(applicant._id, () => tuitionRequestsApi.decline(id, applicant._id))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApplicantCard({
  applicant,
  canRespond,
  busy,
  onAccept,
  onDecline,
}: {
  applicant: TuitionRequestApplicant;
  canRespond: boolean;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { tutor, contact } = applicant;
  const status = APPLICATION_STATUS[applicant.status];
  const photo = assetUrl(tutor?.profilePhoto);
  const facts = [
    tutor?.qualification,
    tutor?.experienceYears ? `${tutor.experienceYears} yrs experience` : undefined,
    tutor?.feeRange ? `₹${tutor.feeRange}/month` : undefined,
    tutor?.rating ? `★ ${tutor.rating.toFixed(1)}` : undefined,
  ].filter(Boolean);

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded asset on the API origin
            <img src={photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light font-semibold text-brand-primary">
              {(tutor?.name ?? "T").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-text-primary">{tutor?.name ?? "Tutor"}</span>
              {tutor?.isVerified && <Badge variant="success">Verified</Badge>}
            </div>
            {facts.length > 0 && <p className="mt-0.5 text-sm text-text-secondary">{facts.join(" · ")}</p>}
            {tutor?.subjects?.length ? (
              <p className="mt-0.5 text-sm text-text-secondary">Teaches {tutor.subjects.join(", ")}</p>
            ) : null}
          </div>
          <Badge variant={status.variant} className="shrink-0">
            {status.label}
          </Badge>
        </div>

        {applicant.message && (
          <blockquote className="rounded-xl bg-bg px-4 py-3 text-sm text-text-primary">“{applicant.message}”</blockquote>
        )}

        {contact && (
          <div className="flex flex-col gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm">
            <span className="font-semibold text-text-primary">Contact {contact.fullName}</span>
            <a href={`tel:${contact.mobileNumber}`} className="font-semibold text-brand-secondary hover:text-brand-primary">
              📞 {contact.mobileNumber}
            </a>
            <a href={`mailto:${contact.email}`} className="break-all font-semibold text-brand-secondary hover:text-brand-primary">
              ✉️ {contact.email}
            </a>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {canRespond && (
            <>
              <Button pill={false} isLoading={busy} onClick={onAccept}>
                Accept tutor
              </Button>
              <Button variant="ghost" pill={false} disabled={busy} onClick={onDecline}>
                Decline
              </Button>
            </>
          )}
          {tutor && (
            <Link
              href={`/find-tutors/${tutor.id}`}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-primary sm:ml-auto"
            >
              View full profile →
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
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
