"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:bg-black/80 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-violet-600">
          onima
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-violet-600">
            Explorar
          </Link>
          {status === "authenticated" ? (
            <>
              <Link href="/communities/new" className="hover:text-violet-600">
                Crear comunidad
              </Link>
              <Link href={`/profile/${session.user?.name}`} className="hover:text-violet-600">
                {session.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-black/5 px-3 py-1 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
              >
                Salir
              </button>
            </>
          ) : status === "loading" ? null : (
            <>
              <Link href="/login" className="hover:text-violet-600">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-violet-600 px-3 py-1 text-white hover:bg-violet-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
