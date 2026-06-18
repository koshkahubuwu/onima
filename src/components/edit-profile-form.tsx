"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditProfileForm({
  initial,
}: {
  initial: { bio: string; title: string; avatarUrl: string; bannerUrl: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(initial.bio);
  const [title, setTitle] = useState(initial.title);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        Editar perfil
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: bio || undefined,
        title: title || undefined,
        avatarUrl: avatarUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900"
    >
      <input
        maxLength={40}
        placeholder="Título (ej. Explorador novato)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
      />
      <textarea
        maxLength={300}
        rows={3}
        placeholder="Biografía"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
      />
      <input
        type="url"
        placeholder="URL de avatar"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
      />
      <input
        type="url"
        placeholder="URL de banner"
        value={bannerUrl}
        onChange={(e) => setBannerUrl(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
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
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
