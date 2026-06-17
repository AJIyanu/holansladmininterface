"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import type { NavigationItem, NavigationSection } from "../../types";

interface StyleOneNavigationProps {
  navigation: NavigationSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

function isRouteActive(pathname: string, href?: string): boolean {
  if (!href) {
    return false;
  }

  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavigationItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isRouteActive(pathname, item.href);

  const link = (
    <Link
      href={item.href ?? "#"}
      onClick={onNavigate}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-[#F46C0B]"
          : "text-white/80 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="size-5 shrink-0" />

      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-white/10 text-[#F46C0B]"
              : "text-white/80 hover:bg-white/10 hover:text-white",
          )}
          aria-label={item.title}
        >
          <Icon className="size-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        className="bg-blue-300 shadow-sm backdrop-blur-md ms-3 border-blue-900 border-2"
      >
        <DropdownMenuItem
          asChild
          className="hover:bg-blue-900 hover:text-white py-2"
        >
          <Link href={item.href ?? "#"} onClick={onNavigate}>
            {item.title}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavigationGroup({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavigationItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;

  const containsActiveRoute = item.children?.some((child) =>
    isRouteActive(pathname, child.href),
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-center rounded-lg transition-colors",
              containsActiveRoute
                ? "bg-white/10 text-[#F46C0B]"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
            aria-label={item.title}
          >
            <Icon className="size-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          className="w-56 bg-blue-300 shadow-sm backdrop-blur-md ms-3 border-blue-900 border-2"
        >
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>

          {item.children?.map((child) => {
            const ChildIcon = child.icon;

            return (
              <DropdownMenuItem key={child.href} asChild>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className="flex items-center gap-2 hover:bg-blue-900 hover:text-white py-2"
                >
                  {ChildIcon && <ChildIcon className="size-4" />}
                  {child.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Collapsible defaultOpen={containsActiveRoute}>
      <CollapsibleTrigger
        className={cn(
          "group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
          containsActiveRoute
            ? "bg-white/10 text-[#F46C0B]"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className="size-5 shrink-0" />

        <span className="flex-1 truncate text-left">{item.title}</span>

        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-1 space-y-1 pl-5">
        {item.children?.map((child) => {
          const ChildIcon = child.icon;
          const active = isRouteActive(pathname, child.href);

          return (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-lg border-l border-white/20 px-3 text-sm transition-colors",
                active
                  ? "border-[#F46C0B] bg-white/10 text-[#F46C0B]"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {ChildIcon && <ChildIcon className="size-4 shrink-0" />}

              <span>{child.title}</span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function StyleOneNavigation({
  navigation,
  collapsed = false,
  onNavigate,
}: StyleOneNavigationProps) {
  return (
    <nav className="space-y-6">
      {navigation.map((section, sectionIndex) => (
        <div key={section.title}>
          {collapsed ? (
            sectionIndex > 0 && (
              <div
                className="mx-2 mb-3 border-t border-white/20"
                aria-hidden="true"
              />
            )
          ) : (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/45">
              {section.title}
            </p>
          )}

          <div className="space-y-1">
            {section.items.map((item) =>
              item.children ? (
                <NavigationGroup
                  key={item.title}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ) : (
                <NavigationLink
                  key={item.title}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}
