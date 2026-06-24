"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ResponsiveActionGuard from "@/components/shared/responsive-action-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import { accountApi } from "../shared/account-api";
import type {
  Department,
  PaginatedResponse,
  StaffProfileSummary,
} from "../shared/access-types";
import {
  glassButtonClass,
  modalClass,
} from "../shared/glass-styles";
import SelectionList from "../shared/selection-list";

export type DepartmentAction =
  | "view-staff"
  | "add-staff"
  | "remove-staff"
  | "edit"
  | "delete";

interface DepartmentActionDialogProps {
  department: Department;
  action: DepartmentAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const titles: Record<DepartmentAction, string> = {
  "view-staff": "Department staff",
  "add-staff": "Add staff",
  "remove-staff": "Remove staff",
  edit: "Edit department",
  delete: "Delete department",
};

export default function DepartmentActionDialog({
  department,
  action,
  open,
  onOpenChange,
}: DepartmentActionDialogProps) {
  const router = useRouter();

  const [profiles, setProfiles] = useState<
    StaffProfileSummary[]
  >([]);

  const [selected, setSelected] = useState<
    Array<string | number>
  >([]);

  const [name, setName] = useState(
    department.name,
  );

  const [code, setCode] = useState(
    department.code,
  );

  const [description, setDescription] =
    useState(
      department.description ?? "",
    );

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!open || !action) {
      return;
    }

    setSelected([]);
    setName(department.name);
    setCode(department.code);
    setDescription(
      department.description ?? "",
    );

    if (
      action !== "view-staff" &&
      action !== "add-staff" &&
      action !== "remove-staff"
    ) {
      return;
    }

    async function loadProfiles() {
      setLoading(true);

      try {
        if (
          action === "view-staff" ||
          action === "remove-staff"
        ) {
          const response =
            await accountApi<
              PaginatedResponse<StaffProfileSummary>
            >(
              `/api/account/profiles?department=${department.id}&page_size=1000&ordering=employee_id`,
            );

          setProfiles(response.results);
          return;
        }

        /*
         * A future inverse backend filter could replace
         * this full fetch:
         *
         * /api/account/profiles?exclude_department=${department.id}
         */

        const response =
          await accountApi<
            PaginatedResponse<StaffProfileSummary>
          >(
            "/api/account/profiles?page_size=1000&ordering=employee_id",
          );

        setProfiles(
          response.results.filter(
            (profile) =>
              profile.department?.id !==
              department.id,
          ),
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load staff.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfiles();
  }, [
    action,
    department.code,
    department.description,
    department.id,
    department.name,
    open,
  ]);

  function toggleSelected(
    id: string | number,
  ) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (currentId) =>
              currentId !== id,
          )
        : [...current, id],
    );
  }

  async function submitAction() {
    if (!action) {
      return;
    }

    setSubmitting(true);

    try {
      if (action === "edit") {
        if (
          name.trim().length < 2 ||
          code.trim().length < 2
        ) {
          throw new Error(
            "Department name and code are required.",
          );
        }

        await accountApi(
          `/api/account/departments/${department.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: name.trim(),
              code: code
                .trim()
                .toUpperCase(),
              description:
                description.trim(),
            }),
          },
        );
      }

      if (
        action === "add-staff" ||
        action === "remove-staff"
      ) {
        const selectedProfiles =
          profiles.filter((profile) =>
            selected.includes(profile.id),
          );

        await Promise.all(
          selectedProfiles.map((profile) =>
            accountApi(
              `/api/account/profiles/${profile.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  department:
                    action === "add-staff"
                      ? department.id
                      : null,
                }),
              },
            ),
          ),
        );
      }

      if (action === "delete") {
        await accountApi(
          `/api/account/departments/${department.id}`,
          {
            method: "DELETE",
          },
        );
      }

      toast.success(
        "Department updated successfully.",
      );

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update department.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!action) {
    return null;
  }

  const sensitive =
    action !== "view-staff";

  const content = (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          {action === "view-staff" && (
            <ScrollArea className="h-96 rounded-lg border border-white/50 bg-white/20 p-3">
              {profiles.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No staff are assigned to this department.
                </p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="rounded-lg border border-white/50 bg-white/30 p-3 backdrop-blur-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {`${profile.user.first_name} ${profile.user.last_name}`.trim() ||
                              profile.user.username}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {profile.job_title} ·{" "}
                            {profile.employee_id}
                          </p>
                        </div>

                        <Badge
                          variant="secondary"
                        >
                          {profile.user.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {(action === "add-staff" ||
            action === "remove-staff") && (
            <SelectionList
              items={profiles.map(
                (profile) => ({
                  id: profile.id,
                  title:
                    `${profile.user.first_name} ${profile.user.last_name}`.trim() ||
                    profile.user.username,
                  description: `${profile.employee_id} · ${profile.job_title}`,
                }),
              )}
              selected={selected}
              onToggle={toggleSelected}
              emptyMessage={
                action === "add-staff"
                  ? "No staff are available to add."
                  : "No staff are assigned to this department."
              }
              searchPlaceholder="Search staff..."
            />
          )}

          {action === "edit" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Department name
                  </label>

                  <Input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value,
                      )
                    }
                    className="mt-2 border-white/50 bg-white/30 backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Department code
                  </label>

                  <Input
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value,
                      )
                    }
                    maxLength={5}
                    className="mt-2 border-white/50 bg-white/30 uppercase backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Description
                </label>

                <Textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="mt-2 border-white/50 bg-white/30 backdrop-blur-md"
                />
              </div>
            </div>
          )}

          {action === "delete" && (
            <div className="rounded-lg border border-red-300 bg-red-50/60 p-4">
              <div className="flex gap-3">
                <Trash2 className="size-5 shrink-0 text-red-600" />

                <div>
                  <p className="font-medium text-red-700">
                    Permanently delete this department?
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    Staff should be moved or removed from the
                    department first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {action !== "view-staff" && (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className={glassButtonClass}
                onClick={() =>
                  onOpenChange(false)
                }
              >
                Cancel
              </Button>

              <Button
                className={glassButtonClass}
                disabled={
                  submitting ||
                  ((action === "add-staff" ||
                    action ===
                      "remove-staff") &&
                    selected.length === 0)
                }
                onClick={submitAction}
              >
                {submitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}

                {action === "delete"
                  ? "Delete department"
                  : "Save changes"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={modalClass}>
        <DialogHeader>
          <DialogTitle>
            {titles[action]}
          </DialogTitle>

          <DialogDescription>
            {department.name} ({department.code})
          </DialogDescription>
        </DialogHeader>

        {sensitive ? (
          <ResponsiveActionGuard
            actionName={titles[
              action
            ].toLowerCase()}
          >
            {content}
          </ResponsiveActionGuard>
        ) : (
          content
        )}
      </DialogContent>
    </Dialog>
  );
}