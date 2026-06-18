const SIZES = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
  xl: "h-24 w-24 text-4xl",
} as const;

export function Avatar({
  username,
  avatarUrl,
  size = "md",
  ring = false,
}: {
  username: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  ring?: boolean;
}) {
  const classes = `flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]} ${
    ring ? "ring-4 ring-white dark:ring-neutral-950" : ""
  } overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500`;

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={username} className={`${classes} object-cover`} />
    );
  }

  return <div className={classes}>{username.charAt(0).toUpperCase()}</div>;
}
