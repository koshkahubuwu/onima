import Link from "next/link";
import { JoinButton } from "@/components/join-button";
import { CommunityTabs } from "@/components/community-tabs";

interface CommunityHeaderProps {
  community: {
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    themeColor: string | null;
    bannerUrl: string | null;
    _count: { memberships: number };
  };
  joined: boolean;
}

export function CommunityHeader({ community, joined }: CommunityHeaderProps) {
  const color = community.themeColor ?? "#7C3AED";
  return (
    <div className="mb-4">
      <div
        className="h-32 w-full rounded-2xl bg-cover bg-center sm:h-40"
        style={
          community.bannerUrl
            ? { backgroundImage: `url(${community.bannerUrl})` }
            : { background: `linear-gradient(135deg, ${color}, #ec4899)` }
        }
      />
      <div className="-mt-8 flex items-end justify-between gap-3 px-1">
        <div className="flex items-end gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-4 ring-[var(--background)]"
            style={{ background: color }}
          >
            {community.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex gap-2 pb-1">
          <JoinButton slug={community.slug} joined={joined} />
          {joined && (
            <Link
              href={`/communities/${community.slug}/chat`}
              className="rounded-full border border-violet-600 px-4 py-2 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              Chat
            </Link>
          )}
        </div>
      </div>

      <div className="mt-2 px-1">
        {community.category && (
          <span className="mb-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
            {community.category}
          </span>
        )}
        <h1 className="text-2xl font-bold">{community.name}</h1>
        {community.description && <p className="mt-1 text-neutral-500">{community.description}</p>}
        <p className="mt-2 text-sm text-neutral-400">{community._count.memberships} miembros</p>
      </div>

      <CommunityTabs slug={community.slug} />
    </div>
  );
}
