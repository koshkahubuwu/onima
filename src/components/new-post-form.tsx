"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPostForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/communities/${slug}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return;
    }

    setTitle("");
    setContent("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 w-full rounded-xl border border-dashed border-black/15 bg-white px-4 py-3 text-left text-neutral-400 hover:border-violet-400 hover:text-violet-600 dark:border-white/15 dark:bg-neutral-900"
      >
        ¿Qué quieres compartir?
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900"
    >
      <input
        required
        maxLength={120}
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-950 dark:border-white/10"
      />
      <textarea
        required
        maxLength={5000}
        rows={4}
        placeholder="Escribe algo..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-950 dark:border-white/10"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
