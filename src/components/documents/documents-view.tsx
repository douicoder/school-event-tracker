"use client";

import * as React from "react";
import {
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
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

function extractTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
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

  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      setPendingFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUploadAll() {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const errors: string[] = [];

    for (const file of pendingFiles) {
      try {
        const form = new FormData();
        form.append("classId", selectedClassId);
        form.append("title", extractTitleFromFilename(file.name));
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
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`);
      }
    }

    setPendingFiles([]);
    if (errors.length > 0) {
      setUploadError(errors.join("; "));
    }
    setUploading(false);
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
  const isPdf = preview?.mimeType === "application/pdf";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{selectedClass?.name}</h1>
            <p className="text-sm text-muted-foreground">{documents.length} documents</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {classes.length > 1 && (
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-48"
              aria-label="Select class"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
          {canManage && (
            <Button onClick={() => setPendingFiles([])} variant="outline">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {canManage && (
        <div className="mt-6 rounded-xl border border-dashed border-border p-4">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,application/pdf,image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center py-4 text-center"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm font-medium">Click to upload files</span>
            <span className="text-xs text-muted-foreground">PDF, images up to 10 MB</span>
          </label>

          {pendingFiles.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              {pendingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="truncate text-sm">{file.name}</span>
                  <button
                    onClick={() => removePendingFile(index)}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPendingFiles([])}>
                  Clear
                </Button>
                <Button size="sm" onClick={handleUploadAll} disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No documents yet</p>
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
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase">
                    {doc.mimeType.split("/")[1]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatSize(doc.sizeBytes)}
                  {doc.uploadedByName && ` • ${doc.uploadedByName}`}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPreview(doc)}>
                    View
                  </Button>
                  <a
                    href={`/api/documents/${doc.id}`}
                    download={doc.fileName}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                  >
                    Download
                  </a>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
        className="max-w-4xl"
      >
        {preview && (
          <div className="space-y-4">
            {/* Download Button - Prominent on Mobile */}
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-medium">{preview.fileName}</p>
                <p className="text-muted-foreground">
                  {preview.mimeType === "application/pdf" ? "PDF Document" : "File"} • {formatSize(preview.sizeBytes)}
                </p>
              </div>
              <a
                href={serveUrl}
                download={preview.fileName}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
              >
                Download File
              </a>
            </div>

            {/* Document Viewer */}
            <div className="relative rounded-lg border bg-muted/10 overflow-hidden">
              {isPdf ? (
                <div className="relative">
                  {/* Mobile-friendly PDF viewer using object tag with fallback */}
                  <object
                    data={serveUrl}
                    type="application/pdf"
                    className="h-[60vh] w-full min-h-[400px]"
                  >
                    {/* Fallback for mobile browsers that don't support embedded PDFs */}
                    <div className="flex h-[400px] flex-col items-center justify-center p-6 text-center">
                      <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                      <p className="mb-2 text-base font-medium">PDF Preview</p>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Your browser doesn't support embedded PDF viewing.
                        Please download the file to view it.
                      </p>
                      <a
                        href={serveUrl}
                        download={preview.fileName}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Download PDF
                      </a>
                    </div>
                  </object>
                </div>
              ) : isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={serveUrl}
                  alt={preview.title}
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center p-6">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-muted-foreground">{preview.fileName}</p>
                </div>
              )}
            </div>
          </div>
        )}
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
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
