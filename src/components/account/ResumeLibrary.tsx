"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { tutorResumeApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api-client";
import { assetUrl } from "@/lib/config";
import type { TutorResume } from "@/types/api";

const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE_MB = 5;

/**
 * The tutor's saved CVs, LinkedIn-style: add as many as they like, each stays until the tutor removes it.
 * When applying for tuition they pick one of these (or upload a new one, which is saved here too).
 */
export function ResumeLibrary() {
  const [resumes, setResumes] = useState<TutorResume[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tutorResumeApi
      .list()
      .then((res) => setResumes(res.items))
      .catch((err) => {
        setResumes([]);
        setError(err instanceof ApiError ? err.message : "Failed to load your resumes.");
      });
  }, []);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!ALLOWED_RESUME_TYPES.has(file.type)) return setError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
    if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024)
      return setError(`File is too large. Maximum size is ${MAX_RESUME_SIZE_MB}MB.`);

    setIsUploading(true);
    try {
      const res = await tutorResumeApi.add(file);
      setResumes(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload your resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove(resume: TutorResume) {
    if (!window.confirm(`Remove "${resume.originalName}" from your saved resumes?`)) return;
    setError(null);
    setRemovingId(resume._id);
    try {
      const res = await tutorResumeApi.remove(resume._id);
      setResumes(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove the resume. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">CV / resume</h2>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isUploading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusIcon />
          {isUploading ? "Uploading…" : "Add new resume"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleSelect}
        />
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Keep one or more CVs here. Older resumes stay until you remove them, and you choose which one to send
          each time you apply. PDF or Word, up to {MAX_RESUME_SIZE_MB}MB.
        </p>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
        )}

        {resumes === null ? (
          <p className="text-sm text-text-secondary">Loading your resumes…</p>
        ) : resumes.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-bg p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-light text-brand-primary">
              <FileIcon />
            </span>
            <p className="text-sm font-medium text-text-primary">No CV uploaded yet</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {resumes.map((resume, index) => (
              <li
                key={resume._id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-light text-brand-primary">
                    <FileIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <span className="truncate" title={resume.originalName}>
                        {resume.originalName}
                      </span>
                      {index === 0 && (
                        <span className="shrink-0 rounded-full bg-brand-secondary-light px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                          Latest
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">Uploaded {formatDate(resume.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={assetUrl(resume.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full px-3 py-1.5 text-sm font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary-light"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(resume)}
                    disabled={removingId === resume._id}
                    className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === resume._id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3v5a1 1 0 001 1h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 21a2 2 0 01-2-2V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6Z" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
