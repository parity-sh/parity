"use client";

import {
  HouseSimpleIcon,
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
  { href: "/launches", label: "Launches", icon: RocketLaunchIcon },
  { href: "/create", label: "Create", icon: PlusCircleIcon },
];

export function SidebarNavItems() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              className={
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              isActive={isActive}
            >
              <Link
                className="flex items-center gap-3 px-3 py-2"
                href={item.href}
              >
                <Icon
                  className="size-[18px]"
                  weight={isActive ? "fill" : "regular"}
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
