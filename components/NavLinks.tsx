"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Target, User, Wrench, type LucideIcon } from "lucide-react";

const BASE_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/practice", label: "Praticar", icon: Target },
  { href: "/profile", label: "Perfil", icon: User },
];

const ADMIN_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/generate", label: "Gerar", icon: Sparkles },
  { href: "/admin/review", label: "Revisão", icon: Wrench },
];

export function NavLinks({
  isAdmin,
  variant,
}: {
  isAdmin: boolean;
  variant: "top" | "bottom";
}) {
  const pathname = usePathname();
  const links = isAdmin ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;

  if (variant === "top") {
    return (
      <nav className="hidden sm:flex items-center gap-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "text-muted hover:bg-border/60"
              }`}
            >
              <Icon size={16} strokeWidth={2.5} />
              {link.label}
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
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-xs font-bold ${
              active ? "text-brand" : "text-muted"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
