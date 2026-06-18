import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const communities = await prisma.community.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Descubrir</h1>
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar comunidades..."
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Buscar
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/search"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !category ? "bg-violet-600 text-white" : "bg-black/5 text-neutral-500 dark:bg-white/10"
          }`}
        >
          Todas
        </Link>
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/search?category=${encodeURIComponent(cat)}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              category === cat ? "bg-violet-600 text-white" : "bg-black/5 text-neutral-500 dark:bg-white/10"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {communities.length === 0 && <p className="text-sm text-neutral-400">Sin resultados.</p>}
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/communities/${c.slug}`}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 hover:border-violet-300 dark:border-white/10 dark:bg-neutral-900"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: c.themeColor ?? "#7C3AED" }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-neutral-400">{c._count.memberships} miembros</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
