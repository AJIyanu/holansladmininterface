import type { ReactNode } from "react";

import LayoutRegistry from "./layout-registry";
import type { DashboardLayoutStyle } from "./types";

interface DashboardLayoutProps {
  children: ReactNode;
}

/*
 * Later this can come from the user's preference:
 *
 * const selectedStyle = user.dashboard_preferences.layout_style;
 */
const selectedStyle: DashboardLayoutStyle = "style-1";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <LayoutRegistry style={selectedStyle}>{children}</LayoutRegistry>;
}
