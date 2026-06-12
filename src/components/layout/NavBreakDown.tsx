"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Icon from "../ui/icon";
import Link from "next/link";

interface SubItem {
  subitemname: string;
  iconname: string;
  link: string;
}

interface NavItem {
  name: string;
  iconname?: string;
  link?: string;
  subitems?: SubItem[];
}

interface NavigationGroup {
  [groupName: string]: NavItem[];
}

interface NavigationBreakdownProps {
  navigationData: NavigationGroup;
  className?: string;
}

export function NavigationBreakdown({
  navigationData,
  className = "",
}: NavigationBreakdownProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [lastRecognizedRoute, setLastRecognizedRoute] = useState<string>("/");

  useEffect(() => {
    const isRecognized = Object.values(navigationData).some((navItems) =>
      navItems.some((navItem) => {
        if (navItem.link === pathname) return true;
        if (navItem.subitems) {
          return navItem.subitems.some((subItem) => subItem.link === pathname);
        }
        return false;
      }),
    );

    if (isRecognized && lastRecognizedRoute !== pathname) {
      // eslint-disable-next-line
      setLastRecognizedRoute(pathname);
    }
  }, [pathname, navigationData, lastRecognizedRoute]);

  const toggleGroup = (itemName: string) => {
    setOpenGroups((prev) =>
      prev.includes(itemName)
        ? prev.filter((g) => g !== itemName)
        : [...prev, itemName],
    );
  };

  const isActiveRoute = (link: string) => {
    return pathname === link || lastRecognizedRoute === link;
  };

  const hasActiveSubItem = (subItems: SubItem[]) => {
    return subItems.some((subItem) => isActiveRoute(subItem.link));
  };

  return (
    <nav className={`space-y-2 ${className}`}>
      {Object.entries(navigationData).map(([groupName, navItems]) => (
        <div key={groupName} className="space-y-1">
          {/* Group Header */}
          <h3 className="font-medium text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
            {groupName}
          </h3>

          {navItems.map((navItem) => {
            // Handle dropdown items (with subitems)
            if (navItem.subitems && navItem.subitems.length > 0) {
              const isOpen = openGroups.includes(navItem.name);
              const hasActive = hasActiveSubItem(navItem.subitems);

              return (
                <Collapsible
                  key={navItem.name}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(navItem.name)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        hasActive ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {navItem.iconname && (
                        <Icon
                          name={navItem.iconname}
                          className="h-4 w-4 mr-2"
                        />
                      )}
                      {navItem.name}
                      <Icon
                        name={isOpen ? "chevrondown" : "chevronright"}
                        className="h-4 w-4 ml-auto"
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 space-y-1">
                    {navItem.subitems.map((subItem) => (
                      <Link key={subItem.subitemname} href={subItem.link}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-sm ${
                            isActiveRoute(subItem.link)
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }`}
                        >
                          <Icon
                            name={subItem.iconname}
                            className="h-3 w-3 mr-2"
                          />
                          {subItem.subitemname}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Handle standalone items
            if (navItem.link) {
              return (
                <Link key={navItem.name} href={navItem.link}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActiveRoute(navItem.link)
                        ? "bg-blue-100 text-blue-700"
                        : ""
                    }`}
                  >
                    {navItem.iconname && (
                      <Icon name={navItem.iconname} className="h-4 w-4 mr-2" />
                    )}
                    {navItem.name}
                  </Button>
                </Link>
              );
            }

            return null;
          })}
        </div>
      ))}
    </nav>
  );
}
