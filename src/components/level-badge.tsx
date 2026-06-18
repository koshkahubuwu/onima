import { expProgress } from "@/lib/exp-level";

export function LevelBadge({ exp, size = "sm" }: { exp: number; size?: "sm" | "md" }) {
  const { level } = expProgress(exp);
  return (
    <span
      className={
        size === "sm"
          ? "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      }
    >
      Nv. {level}
    </span>
  );
}

export function ExpBar({ exp }: { exp: number }) {
  const { level, current, needed } = expProgress(exp);
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
        <span>Nivel {level}</span>
        <span>
          {current}/{needed} EXP
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RoleBadge({ role }: { role: "OWNER" | "LEADER" | "CURATOR" | "MEMBER" }) {
  const styles: Record<string, string> = {
    OWNER: "bg-violet-600 text-white",
    LEADER: "bg-fuchsia-500 text-white",
    CURATOR: "bg-sky-500 text-white",
    MEMBER: "bg-black/5 text-neutral-500 dark:bg-white/10 dark:text-neutral-400",
  };
  const labels: Record<string, string> = {
    OWNER: "Líder fundador",
    LEADER: "Líder",
    CURATOR: "Curador",
    MEMBER: "Miembro",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}
