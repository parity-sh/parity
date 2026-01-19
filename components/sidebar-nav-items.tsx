"use client";

import {
  ArrowSquareOutIcon,
  GithubLogoIcon,
  HouseSimpleIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HouseSimpleIcon },
  { href: "/explore", label: "Explore", icon: MagnifyingGlassIcon },
  { href: "/launches", label: "My Launches", icon: RocketLaunchIcon },
  {
    href: "https://github.com/parity-labs/parity",
    label: "GitHub",
    icon: GithubLogoIcon,
    external: true,
  },
  { href: "/create", label: "Create", icon: PlusCircleIcon, highlight: true },
];

export function SidebarNavItems() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        const content = (
          <>
            <Icon
              className="size-[18px]"
              weight={isActive ? "fill" : "regular"}
            />
            <span className="flex-1 text-sm">{item.label}</span>
            {item.external && (
              <ArrowSquareOutIcon className="size-3.5 opacity-50" />
            )}
          </>
        );

        const highlightClass = item.highlight
          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-[0_0_15px_rgba(255,140,61,0.3)]"
          : "";

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              className={
                item.highlight
                  ? highlightClass
                  : isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              isActive={isActive}
            >
              {item.external ? (
                <a
                  className="flex items-center gap-3 px-3 py-2"
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {content}
                </a>
              ) : (
                <Link
                  className="flex items-center gap-3 px-3 py-2"
                  href={item.href}
                >
                  {content}
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
