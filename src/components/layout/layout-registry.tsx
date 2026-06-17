import type { ReactNode } from "react";

import type { DashboardLayoutStyle } from "./types";
import StyleOneLayout from "./styles/style-1/style-1-layout";

interface RegisteredLayoutProps {
  children: ReactNode;
}

const dashboardLayouts = {
  "style-1": StyleOneLayout,
} satisfies Partial<
  Record<DashboardLayoutStyle, React.ComponentType<RegisteredLayoutProps>>
>;

interface LayoutRegistryProps {
  style: DashboardLayoutStyle;
  children: ReactNode;
}

export default function LayoutRegistry({
  style,
  children,
}: LayoutRegistryProps) {
  const SelectedLayout = dashboardLayouts[style] ?? dashboardLayouts["style-1"];

  return <SelectedLayout>{children}</SelectedLayout>;
}
