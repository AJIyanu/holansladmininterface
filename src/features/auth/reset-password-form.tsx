"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "./reset-password-schema";

interface ResetPasswordFormProps {
  code: string;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function ResetPasswordForm({
  code,
  user,
}: ResetPasswordFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirm: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          password: values.password,
          password_confirm: values.password_confirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Password reset failed.",
        );
      }

      toast.success("Password reset successful.");
      setCompleted(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Password reset failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (completed) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 rounded-full bg-green-50 p-3 text-green-600">
            <CheckCircle2 className="size-8" />
          </div>

          <CardTitle>Password reset successful</CardTitle>

          <CardDescription>
            You can now sign in using your new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayName =
    `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-[#0B4F8A]">
            <LockKeyhole className="size-5" />
          </div>

          <div>
            <CardTitle>Set new password</CardTitle>
            <CardDescription>
              Create a secure password for your account.
            </CardDescription>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Resetting password for{" "}
            <span className="font-medium">{displayName}</span> — {user.email}
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirm((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Password must be at least 12 characters and include uppercase,
              lowercase, number and special character.
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90"
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Reset password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
