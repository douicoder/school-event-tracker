"use client";

import * as React from "react";
import { Check, Loader2, ShieldAlert, Unlock } from "lucide-react";
import type { FlaggedEventInfo, User } from "@/domain";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ModerationPanelProps {
  users: User[];
  onUsersChanged: (users: User[]) => void;
  onError: (message: string) => void;
}

export function ModerationPanel({ users, onUsersChanged, onError }: ModerationPanelProps) {
  const [flagged, setFlagged] = React.useState<FlaggedEventInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [workingId, setWorkingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await api.get<{ flagged: FlaggedEventInfo[] }>("/api/admin/flagged-events");
        if (active) setFlagged(response.flagged);
      } catch (error) {
        if (active) onError(error instanceof Error ? error.message : "Could not load moderation data");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [onError]);

  async function markReviewed(id: string) {
    setWorkingId(id);
    try {
      await api.post(`/api/admin/flagged-events/${id}/review`, {});
      setFlagged((items) => items.map((item) => item.id === id ? { ...item, isReviewed: true } : item));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not mark the submission as reviewed");
    } finally {
      setWorkingId(null);
    }
  }

  async function unban(user: User) {
    setWorkingId(user.id);
    try {
      await api.post(`/api/admin/users/${user.id}/unban`, {});
      onUsersChanged(users.map((item) => item.id === user.id ? { ...item, isBanned: false } : item));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not unban the user");
    } finally {
      setWorkingId(null);
    }
  }

  const bannedUsers = users.filter((user) => user.isBanned);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold">Moderation</h2>
          <p className="text-sm text-muted-foreground">Review blocked submissions and restore accounts when appropriate.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="font-medium">Flagged submissions</h3>
          {loading ? <Loader2 className="mt-4 h-5 w-5 animate-spin text-muted-foreground" /> : (
            <ul className="mt-3 space-y-2">
              {flagged.length === 0 ? <li className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No flagged submissions.</li> : flagged.map((item) => (
                <li key={item.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="font-medium">{item.title}</p><p className="truncate text-muted-foreground">{item.submittedByName ?? "Deleted user"}{item.submittedByEmail ? ` · ${item.submittedByEmail}` : ""}</p><p className="text-muted-foreground">{item.eventDate}{item.className ? ` · ${item.className}` : ""}</p></div>
                    {item.isReviewed ? <Badge variant="secondary">Reviewed</Badge> : <Button size="sm" variant="outline" disabled={workingId === item.id} onClick={() => void markReviewed(item.id)}><Check className="h-4 w-4" />Mark reviewed</Button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="font-medium">Banned users</h3>
          <ul className="mt-3 space-y-2">
            {bannedUsers.length === 0 ? <li className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No banned users.</li> : bannedUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm"><div className="min-w-0"><p className="font-medium">{user.name ?? user.email}</p><p className="truncate text-muted-foreground">{user.email}</p></div><Button size="sm" variant="outline" disabled={workingId === user.id} onClick={() => void unban(user)}><Unlock className="h-4 w-4" />Unban</Button></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
