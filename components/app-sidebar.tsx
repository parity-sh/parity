"use client";

import { SquareHalfIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { SidebarNavItems } from "@/components/sidebar-nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="border-border/50 border-r">
      <SidebarHeader className="p-6">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex size-10 items-center justify-center bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,140,61,0.2)]">
            <SquareHalfIcon className="size-8" weight="bold" />
          </div>
          <span className="font-bold text-xl tracking-tight">Parity</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="mb-6 space-y-1">
          <p className="mb-2 px-3 font-medium text-[11px] text-muted-foreground/60 uppercase tracking-wider">
            Navigation
          </p>
          <SidebarNavItems />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <AuthButton />
      </SidebarFooter>
    </Sidebar>
  );
}
