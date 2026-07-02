"use client";

import { useState } from "react";
import {
  Building2,
  Eye,
  MoreHorizontal,
  Pencil,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission } from "@/lib/permissions";
import type { CurrentUser } from "@/types/auth";

import type { Department } from "../shared/access-types";
import DepartmentActionDialog, {
  type DepartmentAction,
} from "./department-action-dialog";

interface DepartmentCardProps {
  department: Department;
  currentUser: CurrentUser;
}

export default function DepartmentCard({
  department,
  currentUser,
}: DepartmentCardProps) {
  const [action, setAction] = useState<DepartmentAction | null>(null);

  const canEdit = hasPermission(currentUser, "accounts.department.edit");

  const canDelete =
    currentUser.is_superuser ||
    hasPermission(currentUser, "accounts.department.delete");

  const canManageStaff = hasPermission(
    currentUser,
    "accounts.staffprofile.edit",
  );

  return (
    <>
      <Card>
        <CardContent className="flex items-start gap-4 p-5">
          <div className="rounded-xl bg-blue-50 p-3 text-[#0B4F8A]">
            <Building2 className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{department.name}</h2>

              <Badge variant="secondary">{department.code}</Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {department.description ||
                "No department description has been provided."}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onClick={() => setAction("view-staff")}>
                <Eye className="size-4" />
                View staff
              </DropdownMenuItem>

              {canManageStaff && (
                <>
                  <DropdownMenuItem onClick={() => setAction("add-staff")}>
                    <UserPlus className="size-4" />
                    Add staff
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setAction("remove-staff")}>
                    <UserMinus className="size-4" />
                    Remove staff
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled
                    className="cursor-not-allowed opacity-45"
                  >
                    <ShieldPlus className="size-4" />
                    Add role to all staff
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled
                    className="cursor-not-allowed opacity-45"
                  >
                    <ShieldMinus className="size-4" />
                    Remove role from all staff
                  </DropdownMenuItem>
                </>
              )}

              {canEdit && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setAction("edit")}>
                    <Pencil className="size-4" />
                    Edit department
                  </DropdownMenuItem>
                </>
              )}

              {canDelete && (
                <DropdownMenuItem
                  onClick={() => setAction("delete")}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete department
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <DepartmentActionDialog
        department={department}
        action={action}
        open={action !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAction(null);
          }
        }}
      />
    </>
  );
}
