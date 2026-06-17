import type { LucideIcon } from "lucide-react";

export type DashboardLayoutStyle = "style-1"; //| "style-2" | "style-3";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  children?: NavigationChildItem[];
}

export interface NavigationChildItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  permission?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}
