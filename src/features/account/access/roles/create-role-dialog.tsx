"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import ResponsiveActionGuard from "@/components/shared/responsive-action-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { accountApi } from "../shared/account-api";
import { glassButtonClass, modalClass } from "../shared/glass-styles";
// import SelectionList from "../shared/selection-list";
import PermissionMatrixSelector from "../shared/permission-matrix-selector";
import type { Permission } from "../shared/access-types";
import { roleSchema, type RoleFormValues } from "./role-schema";

interface CreateRoleDialogProps {
  permissions: Permission[];
}

export default function CreateRoleDialog({
  permissions,
}: CreateRoleDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  // const selectedPermissions = form.watch("permissions");

  // function togglePermission(id: number) {
  //   const current = form.getValues("permissions");

  //   form.setValue(
  //     "permissions",
  //     current.includes(id)
  //       ? current.filter((permissionId) => permissionId !== id)
  //       : [...current, id],
  //     {
  //       shouldValidate: true,
  //     },
  //   );
  // }

  const selectedPermissions = form.watch("permissions");

  function setSelectedPermissions(permissionIds: number[]) {
    form.setValue("permissions", permissionIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function onSubmit(values: RoleFormValues) {
    try {
      await accountApi("/api/account/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      toast.success("Role created successfully.");

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create role.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90">
          <Plus className="size-4" />
          Add role
        </Button>
      </DialogTrigger>

      <DialogContent className={modalClass}>
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>

          <DialogDescription>
            Name the role and select its initial permissions.
          </DialogDescription>
        </DialogHeader>

        <ResponsiveActionGuard actionName="creating a role">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Procurement Officer"
                        className="border-white/50 bg-white/30 backdrop-blur-md"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Permissions</FormLabel>

                <div className="mt-2">
                  <PermissionMatrixSelector
                    permissions={permissions}
                    selected={selectedPermissions}
                    onSelectedChange={setSelectedPermissions}
                    emptyMessage="No permissions are available."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={glassButtonClass}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className={glassButtonClass}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Create role
                </Button>
              </div>
            </form>
          </Form>
        </ResponsiveActionGuard>
      </DialogContent>
    </Dialog>
  );
}
