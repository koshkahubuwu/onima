"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";

interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT" | "JOIN" | "LEVEL_UP";
  read: boolean;
  createdAt: string;
  actor: { id: string; username: string; avatarUrl: string | null } | null;
  community: { slug: string; name: string } | null;
  postId: string | null;
}

const VERB: Record<NotificationItem["type"], string> = {
  LIKE: "le dio like a tu publicación",
  COMMENT: "comentó tu publicación",
  JOIN: "se unió a tu comunidad",
  LEVEL_UP: "¡Subiste de nivel!",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch("/api/notifications");
      if (res.ok && active) setItems(await res.json());
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  async function handleOpen() {
    setOpen((v) => !v);
    if (unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 text-lg hover:bg-black/5 dark:hover:bg-white/10"
      >
        🔔
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-900">
          <div className="border-b border-black/10 px-4 py-2 text-sm font-semibold dark:border-white/10">
            Notificaciones
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-neutral-400">Nada por aquí todavía.</p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.community ? `/communities/${n.community.slug}` : "#"}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 border-b border-black/5 px-4 py-3 text-sm last:border-0 hover:bg-black/5 dark:border-white/5 dark:hover:bg-white/5"
              >
                {n.actor ? (
                  <Avatar username={n.actor.username} avatarUrl={n.actor.avatarUrl} size="sm" />
                ) : (
                  <span className="text-xl">⭐</span>
                )}
                <span>
                  {n.actor && <span className="font-medium">{n.actor.username} </span>}
                  {VERB[n.type]}
                  {n.community && (
                    <span className="text-neutral-400"> · {n.community.name}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
