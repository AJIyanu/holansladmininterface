"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectionItem {
  id: string | number;
  title: string;
  description?: string;
}

interface SelectionListProps {
  items: SelectionItem[];
  selected: Array<string | number>;
  onToggle: (id: string | number) => void;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export default function SelectionList({
  items,
  selected,
  onToggle,
  emptyMessage = "No options available.",
  searchPlaceholder = "Search...",
}: SelectionListProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      `${item.title} ${item.description ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder={searchPlaceholder}
          className="border-white/50 bg-white/30 pl-9 backdrop-blur-md placeholder:text-muted-foreground/60"
        />
      </div>

      <ScrollArea className="h-72 rounded-lg border border-white/50 bg-white/20 p-3">
        {filteredItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const checked = selected.includes(
                item.id,
              );

              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition hover:border-white/50 hover:bg-white/30"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      onToggle(item.id)
                    }
                    className="mt-0.5"
                  />

                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {item.title}
                    </span>

                    {item.description && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}