"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, UserPlus } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  employmentTypes,
  sexOptions,
  staffSchema,
  type StaffFormValues,
} from "./staff-schema";
import type { Department } from "./types";

interface StaffFormProps {
  departments: Department[];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export default function StaffForm({ departments }: StaffFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema) as Resolver<StaffFormValues>,
    defaultValues: {
      user: {
        username: "",
        email: "",
        first_name: "",
        last_name: "",
      },
      middle_name: "",
      job_title: "",
      employment_type: "FT",
      start_date: getToday(),
      end_date: undefined,
      phone_number: "",
      address: "",
      sex: "M",
      date_of_birth: "",
      nationality: "",
      department: "",
    },
  });

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/account/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          middle_name: values.middle_name ?? "",
          end_date: values.end_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Error response:",
          JSON.stringify(response, null, 2),
          "Data:",
          data,
        );

        throw new Error(
          data.detail ||
            data.message ||
            data.error ||
            "Unable to create the staff account.",
        );
      }

      toast.success("Staff account created successfully.");

      router.push("/dashboard/admin/staff");
      router.refresh();
    } catch (error) {
      console.error("Error creating staff account:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the staff account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleEmailBlur(email: string): void {
    const currentUsername = form.getValues("user.username");

    if (currentUsername || !email.includes("@")) {
      return;
    }

    const generatedUsername = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");

    form.setValue("user.username", generatedUsername, {
      shouldValidate: true,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-[#0B4F8A]">
                <UserPlus className="size-5" />
              </div>

              <div>
                <CardTitle>Account information</CardTitle>

                <CardDescription>
                  Create the user account and company email identity.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="user.first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      autoComplete="given-name"
                      {...field}
                    />
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
                    <Input
                      placeholder="Middle name"
                      autoComplete="additional-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user.last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company email</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@holansl.com"
                      autoComplete="email"
                      {...field}
                      onBlur={(event) => {
                        field.onBlur();
                        handleEmailBlur(event.target.value);
                      }}
                    />
                  </FormControl>

                  <FormDescription>
                    Must use the @holansl.com domain.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user.username"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Username</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Username"
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Automatically suggested from the email address but can be
                    changed.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment information</CardTitle>

            <CardDescription>
              Assign the staff member to a department and employment
              arrangement.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title</FormLabel>
                  <FormControl>
                    <Input placeholder="Procurement Officer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="bg-white/30 backdrop-blur-md">
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                          {department.code ? ` (${department.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="bg-white/30 backdrop-blur-md">
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Start date</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />

                          {field.value
                            ? format(parseISO(field.value), "PPP")
                            : "Select start date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="w-[250px] p-0 bg-white/30 backdrop-blur-md"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseISO(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        disabled={(date) => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                        className="w-full"
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End date</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />

                          {field.value
                            ? format(parseISO(field.value), "PPP")
                            : "Select end date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="w-[250px] bg-white/30 backdrop-blur-md p-0"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseISO(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : undefined,
                          )
                        }
                        disabled={(date) => {
                          const startDate = form.getValues("start_date");

                          return startDate ? date < parseISO(startDate) : false;
                        }}
                        captionLayout="dropdown"
                        className="w-full"
                      />
                    </PopoverContent>
                  </Popover>

                  <FormDescription>
                    Required for part-time, contract and intern staff.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal and contact information</CardTitle>

            <CardDescription>
              Record the staff member&apos;s contact and identification details.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+234..."
                      autoComplete="tel"
                      {...field}
                    />
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
                    <Input placeholder="Nationality" {...field} />
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

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="bg-white/30 backdrop-blur-md">
                      {sexOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />

                          {field.value
                            ? format(parseISO(field.value), "PPP")
                            : "Select date of birth"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className="w-[250px] bg-white/30 backdrop-blur-md p-0"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseISO(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                        className="w-full"
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Residential address"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Create staff
          </Button>
        </div>
      </form>
    </Form>
  );
}
