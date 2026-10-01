"use client";

import * as React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { ClassInfo, User, UserRole } from "@/domain";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

interface UserProvisioningProps {
  users: User[];
  classes: ClassInfo[];
  currentUserId: string;
  onUsersChanged: (users: User[]) => void;
  onError: (message: string) => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  assignedClassId: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "class_manager",
  assignedClassId: "",
};

export function UserProvisioning({
  users,
  classes,
  currentUserId,
  onUsersChanged,
  onError,
}: UserProvisioningProps) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const defaultClassId = classes[0]?.id ?? "";

  function openCreate() {
    setForm({ ...emptyForm, assignedClassId: defaultClassId });
    setFormError(null);
    setCreating(true);
  }

  function openEdit(user: User) {
    setForm({
      name: user.name ?? "",
      email: user.email,
      password: "",
      role: user.role,
      assignedClassId: user.assignedClassId ?? "",
    });
    setFormError(null);
    setEditing(user);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function roleLabel(role: UserRole) {
    return role === "admin" ? "Admin" : "Class Manager";
  }

  function classNameFor(id: string | null) {
    return classes.find((c) => c.id === id)?.name ?? "—";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const isManager = form.role === "class_manager";
      if (editing) {
        const payload: {
          name: string;
          role: UserRole;
          assignedClassId: string | null;
          password?: string;
        } = {
          name: form.name.trim(),
          role: form.role,
          assignedClassId: isManager ? form.assignedClassId || null : null,
        };
        if (form.password.trim()) payload.password = form.password;
        const res = await api.patch<{ user: User }>(`/api/admin/users/${editing.id}`, payload);
        onUsersChanged(users.map((u) => (u.id === editing.id ? res.user : u)));
      } else {
        const res = await api.post<{ user: User }>("/api/admin/users", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          assignedClassId: isManager ? form.assignedClassId || null : null,
        });
        onUsersChanged([...users, res.user]);
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
      await api.delete(`/api/admin/users/${deleteTarget.id}`);
      onUsersChanged(users.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete user");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const showClassField = form.role === "class_manager";

  return (
    <section
      className="animate-fade-in-up rounded-2xl border border-border bg-card p-5"
      style={{ animationDelay: "70ms" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">User Provisioning</h2>
          <p className="text-sm text-muted-foreground">Manage managers and admins.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New user
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {users.length === 0 ? (
          <li>
            <EmptyState compact icon={UsersIcon} title="No users yet." className="py-6" />
          </li>
        ) : (
          users.map((user, index) => (
            <li
              key={user.id}
              className="animate-fade-in-up flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              style={{ animationDelay: `${Math.min(index * 50, 350)}ms` }}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-medium">
                  {user.name ?? user.email}
                  {user.id === currentUserId ? <Badge variant="secondary">You</Badge> : null}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{roleLabel(user.role)}</Badge>
                  {user.role === "class_manager" ? classNameFor(user.assignedClassId) : null}
                  {user.name ? <span className="truncate">{user.email}</span> : null}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={`Edit ${user.email}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(user)}
                  aria-label={`Delete ${user.email}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={user.id === currentUserId}
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
        title={editing ? "Edit user" : "New user"}
        description={
          editing
            ? "Change this user's role, class, or reset their password."
            : "Create a manager or admin account."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <Input
              id="user-name"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Alex Johnson"
            />
          </div>

          {!editing ? (
            <div>
              <label htmlFor="user-email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="user-email"
                type="email"
                required
                maxLength={120}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="user@school.edu"
              />
            </div>
          ) : (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              {editing.email}
            </p>
          )}

          <div>
            <label htmlFor="user-password" className="mb-1 block text-sm font-medium">
              Password
              {editing ? <span className="text-muted-foreground"> (leave blank to keep)</span> : null}
            </label>
            <Input
              id="user-password"
              type="password"
              required={!editing}
              minLength={8}
              maxLength={100}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="user-role" className="mb-1 block text-sm font-medium">
                Role
              </label>
              <Select
                value={form.role}
                onValueChange={(value) => updateField("role", value as UserRole)}
              >
                <SelectTrigger id="user-role" className="w-full" aria-label="Role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class_manager">Class Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showClassField ? (
              <div>
                <label htmlFor="user-class" className="mb-1 block text-sm font-medium">
                  Assigned class
                </label>
                <Select
                  value={form.assignedClassId || "none"}
                  onValueChange={(value) =>
                    updateField("assignedClassId", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger id="user-class" className="w-full" aria-label="Assigned class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
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
              {editing ? "Save changes" : "Create user"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete user"
        description="This account will no longer be able to sign in."
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{deleteTarget?.email}</span>?
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
