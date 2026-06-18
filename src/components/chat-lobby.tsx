"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RoomItem {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  isMember: boolean;
}

export function ChatLobby({
  slug,
  rooms,
  canCreate,
}: {
  slug: string;
  rooms: RoomItem[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(rooms);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function joinRoom(roomId: string) {
    setLoadingId(roomId);
    const res = await fetch(`/api/communities/${slug}/chat/${roomId}/join`, { method: "POST" });
    if (res.status === 401) {
      router.push("/login");
      setLoadingId(null);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setItems((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, isMember: data.joined, memberCount: r.memberCount + (data.joined ? 1 : -1) }
            : r
        )
      );
      if (data.joined) router.push(`/communities/${slug}/chat/${roomId}`);
    }
    setLoadingId(null);
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch(`/api/communities/${slug}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return;
    }
    router.push(`/communities/${slug}/chat/${data.id}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="text-sm text-neutral-400">Todavía no hay salas de chat.</p>}
      {items.map((room) => (
        <div
          key={room.id}
          className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900"
        >
          <div className="flex-1">
            <p className="font-medium">#{room.name}</p>
            {room.description && <p className="text-sm text-neutral-400">{room.description}</p>}
            <p className="text-xs text-neutral-400">{room.memberCount} miembros</p>
          </div>
          {room.isMember ? (
            <Link
              href={`/communities/${slug}/chat/${room.id}`}
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Entrar
            </Link>
          ) : (
            <button
              disabled={loadingId === room.id}
              onClick={() => joinRoom(room.id)}
              className="rounded-full border border-violet-600 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:opacity-50 dark:hover:bg-violet-900/20"
            >
              Unirse
            </button>
          )}
        </div>
      ))}

      {canCreate && (
        <div className="mt-2">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              + Crear sala de chat
            </button>
          ) : (
            <form
              onSubmit={createRoom}
              className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900"
            >
              <input
                required
                maxLength={40}
                placeholder="Nombre de la sala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
              />
              <input
                maxLength={200}
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
