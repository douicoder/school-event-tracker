"use client";

import * as React from "react";
import {
  Eye,
  FileText,
  Loader2,
  Lock,
  Trash2,
  Upload,
} from "lucide-react";
import type { ClassInfo, DocumentInfo, UserRole } from "@/domain";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

interface DocumentsViewProps {
  classes: ClassInfo[];
  initialClassId: string;
  role: UserRole | null;
  assignedClassId: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsView({
  classes,
  initialClassId,
  role,
  assignedClassId,
}: DocumentsViewProps) {
  const [selectedClassId, setSelectedClassId] = React.useState(initialClassId);
  const [documents, setDocuments] = React.useState<DocumentInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [preview, setPreview] = React.useState<DocumentInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentInfo | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? classes[0];
  const canManage =
    role === "admin" || (role === "class_manager" && assignedClassId === selectedClassId);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<{ documents: DocumentInfo[] }>(
          `/api/classes/${selectedClassId}/documents`,
        );
        if (!cancelled) setDocuments(data.documents);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !title.trim()) {
      setUploadError("Title and file are required");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("classId", selectedClassId);
      form.append("title", title.trim());
      form.append("file", file);
      const res = await fetch(`/api/classes/${selectedClassId}/documents`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Upload failed");
      }
      const data = (await res.json()) as { document: DocumentInfo };
      setDocuments((prev) => [data.document, ...prev]);
      setTitle("");
      setFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/documents/${deleteTarget.id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const serveUrl = preview ? `/api/documents/${preview.id}` : "";
  const isImage = preview?.mimeType.startsWith("image/");

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{selectedClass?.name}</h1>
              <p className="text-sm text-muted-foreground">Class documents</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {classes.length > 1 ? (
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full sm:w-56"
                aria-label="Select class"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            ) : null}

            {canManage ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                <Lock className="h-3 w-3" />
                Can manage
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {canManage ? (
        <form
          onSubmit={handleUpload}
          className="mt-6 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Syllabus 2025"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">File (PDF, JPEG, PNG, WebP, GIF, max 10 MB)</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </label>
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </div>
          {uploadError ? (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {uploadError}
            </p>
          ) : null}
        </form>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading documents…
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 py-14 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No documents yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {canManage
                ? "Upload the first document for this class using the form above."
                : "There are no documents for this class yet."}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium" title={doc.title}>
                      {doc.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-secondary-foreground">
                    {doc.mimeType.split("/")[1]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatSize(doc.sizeBytes)}
                  {doc.uploadedByName ? ` · ${doc.uploadedByName}` : ""}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPreview(doc)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <a
                    href={`/api/documents/${doc.id}`}
                    download={doc.fileName}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground"
                  >
                    Download
                  </a>
                  {canManage ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.title ?? "Document"}
      >
        {preview ? (
          <div className="max-h-[70vh] overflow-auto">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={serveUrl}
                alt={preview.title}
                className="mx-auto max-h-[60vh] rounded-lg object-contain"
              />
            ) : (
              <iframe src={serveUrl} title={preview.title} className="h-[60vh] w-full rounded-lg" />
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete document"
        description="This action cannot be undone."
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{deleteTarget?.title}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
