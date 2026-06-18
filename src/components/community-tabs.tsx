"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CommunityTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/communities/${slug}`;
  const tabs = [
    { href: base, label: "Inicio", exact: true },
    { href: `${base}/wiki`, label: "Wiki" },
    { href: `${base}/leaderboard`, label: "Leaderboard" },
    { href: `${base}/members`, label: "Miembros" },
    { href: `${base}/chat`, label: "Chats" },
  ];

  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-black/10 scrollbar-hide dark:border-white/10">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
              active
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-neutral-400 hover:text-violet-600"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
