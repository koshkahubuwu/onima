"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMUNITY_CATEGORIES, THEME_COLORS } from "@/lib/constants";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NewCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(COMMUNITY_CATEGORIES[0]);
  const [themeColor, setThemeColor] = useState<string>(THEME_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, category, themeColor }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return;
    }

    router.push(`/communities/${data.slug}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold">Crear una nueva Amino</h1>
      <p className="mb-6 text-sm text-neutral-400">Funda tu propia comunidad temática.</p>

      <div
        className="mb-6 h-24 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${themeColor}, #ec4899)` }}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            required
            maxLength={40}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-900 dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Identificador (URL)
          <input
            required
            maxLength={40}
            pattern="[a-z0-9\-]+"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm dark:bg-neutral-900 dark:border-white/10"
          />
          <span className="text-xs text-neutral-400">/communities/{slug || "..."}</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-900 dark:border-white/10"
          >
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-sm">
          Color de marca
          <div className="flex gap-2">
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setThemeColor(color)}
                className={`h-8 w-8 rounded-full ${themeColor === color ? "ring-2 ring-offset-2 ring-black/40 dark:ring-white/40" : ""}`}
                style={{ background: color }}
                aria-label={color}
              />
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-900 dark:border-white/10"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-3 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear comunidad"}
        </button>
      </form>
    </div>
  );
}
