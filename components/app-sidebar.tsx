"use client";

import {
  ArrowSquareOutIcon,
  GithubLogoIcon,
  SquareHalfIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { SidebarNavItems } from "@/components/sidebar-nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="flex size-8 items-center justify-center bg-primary">
            <SquareHalfIcon
              className="size-8 text-primary-foreground"
              weight="bold"
            />
          </div>
          <span className="font-semibold text-base tracking-tight">Parity</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarNavItems />

        <div className="mt-8">
          <p className="mb-2 px-3 font-medium text-[11px] text-muted-foreground/60 uppercase tracking-wider">
            Links
          </p>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <a
                  className="flex items-center gap-3 px-3 py-2"
                  href="https://github.com/parity-labs/parity"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <GithubLogoIcon className="size-[18px]" />
                  <span className="flex-1 text-sm">GitHub</span>
                  <ArrowSquareOutIcon className="size-3.5 opacity-50" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <AuthButton />
      </SidebarFooter>
    </Sidebar>
  );
}
