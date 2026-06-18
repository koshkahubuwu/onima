"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinButton({ slug, joined }: { slug: string; joined: boolean }) {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(joined);
  const [loading, setLoading] = useState(false);

  async function toggleJoin() {
    setLoading(true);
    const res = await fetch(`/api/communities/${slug}/join`, { method: "POST" });
    if (res.status === 401) {
      router.push("/login");
      setLoading(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setIsJoined(data.joined);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleJoin}
      disabled={loading}
      className={
        isJoined
          ? "rounded-full bg-black/5 px-4 py-2 text-sm font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
          : "rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      }
    >
      {isJoined ? "Unido ✓" : "Unirse"}
    </button>
  );
}
