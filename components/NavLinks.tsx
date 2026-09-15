"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/dashboard", label: "Início", emoji: "🏠" },
  { href: "/practice", label: "Praticar", emoji: "🎯" },
];

export function NavLinks({
  isAdmin,
  variant,
}: {
  isAdmin: boolean;
  variant: "top" | "bottom";
}) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...BASE_LINKS, { href: "/admin/review", label: "Revisão", emoji: "🛠️" }]
    : BASE_LINKS;

  if (variant === "top") {
    return (
      <nav className="hidden sm:flex items-center gap-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-border/60"
              }`}
            >
              {link.emoji} {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 flex justify-around border-t border-border bg-surface py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-xs font-bold ${
              active ? "text-brand" : "text-muted"
            }`}
          >
            <span className="text-xl">{link.emoji}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
