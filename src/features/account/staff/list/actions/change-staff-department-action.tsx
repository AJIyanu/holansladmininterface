"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

interface PaginatedDepartments {
  count: number;
  next: string | null;
  previous: string | null;
  results: DepartmentOption[];
}

const NO_DEPARTMENT = "__none__";

export default function ChangeStaffDepartmentAction({
  profile,
  onClose,
  onCompleted,
}: StaffActionContentProps) {
  const originalId = profile.department?.id ?? NO_DEPARTMENT;

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [selectedId, setSelectedId] = useState(originalId);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const selectedDepartment = useMemo(
    () =>
      departments.find((department) => department.id === selectedId) ?? null,
    [departments, selectedId],
  );

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      try {
        const response = await staffActionApi<PaginatedDepartments>(
          "/api/account/departments?page_size=1000&ordering=name",
        );

        if (active) {
          setDepartments(response.results);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load departments.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      active = false;
    };
  }, []);

  function selectDepartment(value: string) {
    setSelectedId(value);
    setConfirming(false);
  }

  async function updateDepartment() {
    setSaving(true);

    try {
      await staffActionApi(`/api/account/profiles/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department: selectedId === NO_DEPARTMENT ? null : selectedId,
        }),
      });

      toast.success("Department updated successfully.");

      onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update department.",
      );
    } finally {
      setSaving(false);
    }
  }

  const changed = selectedId !== originalId;

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium">Select department</label>

            <Select value={selectedId} onValueChange={selectDepartment}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_DEPARTMENT}>No department</SelectItem>

                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name} ({department.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Current department
              </p>

              <p className="mt-1 font-medium">
                {profile.department
                  ? `${profile.department.name} (${profile.department.code})`
                  : "No department"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                New department
              </p>

              <p className="mt-1 font-medium">
                {selectedId === NO_DEPARTMENT
                  ? "No department"
                  : selectedDepartment
                    ? `${selectedDepartment.name} (${selectedDepartment.code})`
                    : "Not selected"}
              </p>
            </div>
          </div>
        </>
      )}

      {confirming && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <p className="font-semibold text-amber-900">
                Confirm department change
              </p>

              <p className="mt-1 text-sm text-amber-800">
                This will move the staff member from{" "}
                <strong>{profile.department?.name ?? "no department"}</strong>{" "}
                to{" "}
                <strong>{selectedDepartment?.name ?? "no department"}</strong>.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirming(false)}
                >
                  Go back
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={saving}
                  onClick={updateDepartment}
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Confirm change
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!confirming && (
        <div className="flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!changed || loading}
            onClick={() => setConfirming(true)}
          >
            Update department
          </Button>
        </div>
      )}
    </div>
  );
}
