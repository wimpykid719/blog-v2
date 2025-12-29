"use client";

export function NotificationBadge() {
  return (
    <span className="relative inline-flex size-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex size-2 rounded-full bg-emerald-400"></span>
    </span>
  );
}
