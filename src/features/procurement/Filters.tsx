"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Option } from "./types";

export function ProcurementFilters({
  kind,
  initial,
  clients,
}: {
  kind: "requests" | "trackers";
  initial: Record<string, string>;
  clients: Option[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initial.search || "");
  const [client, setClient] = useState(initial.client || "ALL");
  const [state, setState] = useState(
    initial[kind === "requests" ? "received_via" : "status"] || "ALL",
  );
  const [ordering, setOrdering] = useState(initial.ordering || "-created_at");
  function apply() {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (client !== "ALL") query.set("client", client);
    if (state !== "ALL")
      query.set(kind === "requests" ? "received_via" : "status", state);
    query.set("ordering", ordering);
    router.push(
      `/dashboard/procurement/${kind === "requests" ? "requests" : "items"}?${query}`,
    );
  }
  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search item, code or client"
        className="lg:col-span-2"
      />
      <Select value={client} onValueChange={setClient}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md">
          <SelectItem value="ALL">All clients</SelectItem>
          {clients.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={state} onValueChange={setState}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md">
          <SelectItem value="ALL">
            {kind === "requests" ? "All channels" : "All statuses"}
          </SelectItem>
          {kind === "requests" ? (
            <>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="CALL">Call</SelectItem>
              <SelectItem value="WALK_IN">Walk-in</SelectItem>
              <SelectItem value="CUSTOM">Custom</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
      <Select value={ordering} onValueChange={setOrdering}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md">
          <SelectItem value="-created_at">Newest first</SelectItem>
          <SelectItem value="created_at">Oldest first</SelectItem>
          {kind === "trackers" && (
            <>
              <SelectItem value="name">Item name</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </>
          )}{" "}
          {kind === "requests" && (
            <SelectItem value="client_name">Client name</SelectItem>
          )}
        </SelectContent>
      </Select>
      <div className="flex gap-2 lg:col-span-5">
        <Button type="button" onClick={apply}>
          Apply filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              `/dashboard/procurement/${kind === "requests" ? "requests" : "items"}`,
            )
          }
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
