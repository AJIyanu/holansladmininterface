"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { accountApi } from "../shared/account-api";
import {
  glassButtonClass,
  modalClass,
} from "../shared/glass-styles";
import {
  departmentSchema,
  type DepartmentFormValues,
} from "./department-schema";

export default function CreateDepartmentDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(
      departmentSchema,
    ),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  async function onSubmit(
    values: DepartmentFormValues,
  ) {
    try {
      await accountApi(
        "/api/account/departments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      toast.success(
        "Department created successfully.",
      );

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create department.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90">
          <Plus className="size-4" />
          Add department
        </Button>
      </DialogTrigger>

      <DialogContent className={modalClass}>
        <DialogHeader>
          <DialogTitle>
            Create department
          </DialogTitle>

          <DialogDescription>
            Add a department to the company structure.
          </DialogDescription>
        </DialogHeader>

        <ResponsiveActionGuard actionName="creating a department">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                onSubmit,
              )}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department name
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Human Resources"
                          className="border-white/50 bg-white/30 backdrop-blur-md"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department code
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="HR"
                          className="border-white/50 bg-white/30 uppercase backdrop-blur-md"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="Describe the department's responsibilities..."
                        rows={4}
                        className="border-white/50 bg-white/30 backdrop-blur-md"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={glassButtonClass}
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className={glassButtonClass}
                  disabled={
                    form.formState.isSubmitting
                  }
                >
                  {form.formState
                    .isSubmitting && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  Create department
                </Button>
              </div>
            </form>
          </Form>
        </ResponsiveActionGuard>
      </DialogContent>
    </Dialog>
  );
}