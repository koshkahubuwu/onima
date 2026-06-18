"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/search", label: "Buscar", icon: "🔍" },
  { href: "/communities/new", label: "Crear", icon: "➕" },
  { href: "/notifications", label: "Alertas", icon: "🔔" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-neutral-950/95 md:hidden">
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? "text-violet-600" : "text-neutral-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <Link
          href={session?.user?.name ? `/profile/${session.user.name}` : "/login"}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
            pathname.startsWith("/profile") ? "text-violet-600" : "text-neutral-400"
          }`}
        >
          <span className="text-lg">👤</span>
          Perfil
        </Link>
      </div>
    </nav>
  );
}
