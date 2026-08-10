"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { ClassInfo } from "@/domain";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface ClassManagementProps {
  classes: ClassInfo[];
  onClassesChanged: (classes: ClassInfo[]) => void;
  onError: (message: string) => void;
}

export function ClassManagement({ classes, onClassesChanged, onError }: ClassManagementProps) {
  const [editing, setEditing] = React.useState<ClassInfo | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ClassInfo | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  function openCreate() {
    setName("");
    setDescription("");
    setFormError(null);
    setCreating(true);
  }

  function openEdit(cls: ClassInfo) {
    setName(cls.name);
    setDescription(cls.description ?? "");
    setFormError(null);
    setEditing(cls);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = { name: name.trim(), description: description.trim() || null };
      if (editing) {
        const res = await api.patch<{ class: ClassInfo }>(`/api/classes/${editing.id}`, payload);
        onClassesChanged(classes.map((c) => (c.id === editing.id ? res.class : c)));
      } else {
        const res = await api.post<{ class: ClassInfo }>("/api/classes", payload);
        onClassesChanged([...classes, res.class]);
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/classes/${deleteTarget.id}`);
      onClassesChanged(classes.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete class");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Class Management</h2>
          <p className="text-sm text-muted-foreground">Create and maintain classes.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New class
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {classes.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No classes yet.
          </li>
        ) : (
          classes.map((cls) => (
            <li
              key={cls.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{cls.name}</p>
                {cls.description ? (
                  <p className="truncate text-sm text-muted-foreground">{cls.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cls)} aria-label={`Edit ${cls.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(cls)}
                  aria-label={`Delete ${cls.name}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      <Modal
        open={creating || !!editing}
        onClose={closeForm}
        title={editing ? "Edit class" : "New class"}
        description={editing ? "Update the class details." : "Add a new class to the tracker."}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="class-name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <Input
              id="class-name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CS-101"
            />
          </div>
          <div>
            <label htmlFor="class-description" className="mb-1 block text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="class-description"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Intro to Computer Science"
            />
          </div>
          {formError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create class"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete class"
        description="All events in this class will be permanently removed."
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
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
    </section>
  );
}
