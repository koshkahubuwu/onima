import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true, posts: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Explorar comunidades</h1>
        <Link
          href="/communities/new"
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Nueva comunidad
        </Link>
      </div>

      {communities.length === 0 ? (
        <p className="text-neutral-500">
          Todavía no hay comunidades. ¡Sé el primero en crear una!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/communities/${c.slug}`}
              className="rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-600 dark:bg-violet-900/40">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-semibold">{c.name}</h2>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{c.description}</p>
              )}
              <p className="mt-3 text-xs text-neutral-400">
                {c._count.memberships} miembros · {c._count.posts} posts
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
