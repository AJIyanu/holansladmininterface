"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

const editStaffSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username is required.")
    .max(150)
    .regex(/^[\w.@+-]+$/, "Username contains invalid characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .refine(
      (value) => value.toLowerCase().endsWith("@holansl.com"),
      "Email must use the @holansl.com domain.",
    ),

  first_name: z.string().trim().min(1, "First name is required.").max(150),

  middle_name: z.string().trim().max(100),

  last_name: z.string().trim().min(1, "Last name is required.").max(150),

  job_title: z.string().trim().min(2, "Job title is required.").max(100),

  employment_type: z.enum(["FT", "PT", "CT", "IN"]),

  start_date: z.string().min(1, "Start date is required."),

  end_date: z.string().optional(),

  phone_number: z.string().trim().min(5, "Phone number is required.").max(20),

  address: z.string().trim().max(255),

  sex: z.enum(["M", "F", ""]),

  date_of_birth: z.string().optional(),

  nationality: z.string().trim().max(100),
});

type EditStaffValues = z.infer<typeof editStaffSchema>;

export default function EditStaffAction({
  profile,
  onClose,
  onCompleted,
}: StaffActionContentProps) {
  const form = useForm<EditStaffValues>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      username: profile.user.username,
      email: profile.user.email,
      first_name: profile.user.first_name,
      middle_name: profile.middle_name ?? "",
      last_name: profile.user.last_name,
      job_title: profile.job_title,
      employment_type: profile.employment_type,
      start_date: profile.start_date,
      end_date: profile.end_date ?? "",
      phone_number: profile.phone_number,
      address: profile.address ?? "",
      sex: profile.sex ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      nationality: profile.nationality ?? "",
    },
  });

  async function onSubmit(values: EditStaffValues) {
    try {
      await staffActionApi(`/api/account/profiles/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            username: values.username,
            email: values.email,
            first_name: values.first_name,
            last_name: values.last_name,
          },
          middle_name: values.middle_name || "",
          job_title: values.job_title,
          employment_type: values.employment_type,
          start_date: values.start_date,
          end_date: values.end_date || null,
          phone_number: values.phone_number,
          address: values.address || "",
          sex: values.sex || null,
          date_of_birth: values.date_of_birth || null,
          nationality: values.nationality || "",
        }),
      });

      toast.success("Staff details updated successfully.");

      onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update staff.",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle name</FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Email</FormLabel>

                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-5">
          <h3 className="mb-4 font-semibold">Employment details</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment type</FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="FT">Full-Time</SelectItem>

                      <SelectItem value="PT">Part-Time</SelectItem>

                      <SelectItem value="CT">Contract</SelectItem>

                      <SelectItem value="IN">Intern</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>

                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End date</FormLabel>

                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-5">
          <h3 className="mb-4 font-semibold">
            Personal and contact information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>

                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>

                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address</FormLabel>

                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
