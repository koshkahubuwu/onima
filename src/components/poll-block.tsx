"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PollOption {
  id: string;
  text: string;
  _count: { votes: number };
}

export function PollBlock({
  postId,
  options,
  votedOptionId,
}: {
  postId: string;
  options: PollOption[];
  votedOptionId: string | null;
}) {
  const router = useRouter();
  const [localOptions, setLocalOptions] = useState(options);
  const [voted, setVoted] = useState(votedOptionId);
  const [loading, setLoading] = useState(false);

  const total = localOptions.reduce((sum, o) => sum + o._count.votes, 0);

  async function vote(optionId: string) {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/poll/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (res.status === 401) {
      router.push("/login");
      setLoading(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setLocalOptions(data.options);
      setVoted(data.votedOptionId);
    }
    setLoading(false);
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">📊 Encuesta</span>
      {localOptions.map((opt) => {
        const pct = total > 0 ? Math.round((opt._count.votes / total) * 100) : 0;
        const isVoted = voted === opt.id;
        return (
          <button
            key={opt.id}
            disabled={loading}
            onClick={() => vote(opt.id)}
            className="relative overflow-hidden rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 text-left text-sm dark:border-white/10 dark:bg-white/5"
          >
            <div
              className={`absolute inset-y-0 left-0 ${isVoted ? "bg-violet-200 dark:bg-violet-900/50" : "bg-black/5 dark:bg-white/10"}`}
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className={isVoted ? "font-medium text-violet-700 dark:text-violet-300" : ""}>
                {isVoted ? "✓ " : ""}
                {opt.text}
              </span>
              <span className="text-neutral-400">{pct}%</span>
            </div>
          </button>
        );
      })}
      <span className="text-xs text-neutral-400">{total} votos</span>
    </div>
  );
}
