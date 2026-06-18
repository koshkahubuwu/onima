"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { LevelBadge, RoleBadge } from "@/components/level-badge";

type Role = "OWNER" | "LEADER" | "CURATOR" | "MEMBER";

interface MemberItem {
  id: string;
  exp: number;
  role: Role;
  user: { id: string; username: string; avatarUrl: string | null };
}

export function MemberList({
  slug,
  members,
  canManage,
}: {
  slug: string;
  members: MemberItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(members);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function changeRole(userId: string, role: Role) {
    setLoadingId(userId);
    const res = await fetch(`/api/communities/${slug}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((m) => (m.user.id === userId ? { ...m, role: updated.role } : m)));
      router.refresh();
    }
    setLoadingId(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-neutral-900"
        >
          <Link href={`/profile/${m.user.username}`}>
            <Avatar username={m.user.username} avatarUrl={m.user.avatarUrl} size="sm" />
          </Link>
          <Link href={`/profile/${m.user.username}`} className="flex-1 font-medium hover:text-violet-600">
            {m.user.username}
          </Link>
          <LevelBadge exp={m.exp} />
          <RoleBadge role={m.role} />
          {canManage && m.role !== "OWNER" && (
            <select
              disabled={loadingId === m.user.id}
              value={m.role}
              onChange={(e) => changeRole(m.user.id, e.target.value as Role)}
              className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs dark:bg-neutral-950 dark:border-white/10"
            >
              <option value="MEMBER">Miembro</option>
              <option value="CURATOR">Curador</option>
              <option value="LEADER">Líder</option>
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
