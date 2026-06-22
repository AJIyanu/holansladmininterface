"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "./forgot-password-schema";

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);

    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 rounded-full bg-green-50 p-3 text-green-600">
            <CheckCircle2 className="size-8" />
          </div>

          <CardTitle>Check your email</CardTitle>

          <CardDescription>
            If the email exists in our records, a reset link will be sent to it.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-[#0B4F8A]">
            <Mail className="size-5" />
          </div>

          <div>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              Enter your email to request a reset link.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@holansl.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90"
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Send reset link
            </Button>

            <Button type="button" variant="ghost" asChild className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
