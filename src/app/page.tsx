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
        <div>
          <h1 className="text-2xl font-bold">Explorar comunidades</h1>
          <p className="text-sm text-neutral-400">Encuentra tu Amino favorito</p>
        </div>
        <Link
          href="/communities/new"
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
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
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
            >
              <div
                className="h-20 w-full bg-cover bg-center"
                style={
                  c.bannerUrl
                    ? { backgroundImage: `url(${c.bannerUrl})` }
                    : { background: `linear-gradient(135deg, ${c.themeColor ?? "#7C3AED"}, #ec4899)` }
                }
              />
              <div className="-mt-6 px-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white ring-4 ring-white dark:ring-neutral-900"
                  style={{ background: c.themeColor ?? "#7C3AED" }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="px-4 pb-4 pt-2">
                {c.category && (
                  <span className="mb-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
                    {c.category}
                  </span>
                )}
                <h2 className="font-semibold group-hover:text-violet-600">{c.name}</h2>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{c.description}</p>
                )}
                <p className="mt-3 text-xs text-neutral-400">
                  {c._count.memberships} miembros · {c._count.posts} posts
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
