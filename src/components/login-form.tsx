"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

// Zod validation schema
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(2, "Password must be at least 2 characters"),
  // .regex(/[A-Z]/, "Password must contain at least one capital letter")
  // .regex(/[0-9]/, "Password must contain at least one number"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result?.error?.reset_required) {
        toast.warning(
          result.error.detail ||
            "Password change required. Please check your email.",
        );

        setError(
          result.error.code ||
            "Password change required. Please check your email.",
        );

        return;
      }

      if (response.ok && result.success) {
        // Get redirect URL from query params or default to dashboard
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get("redirect") || "/dashboard";

        router.push(redirectTo);
        router.refresh();
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Login failed. Please try again.");
      }
    } catch {
      console.error("Network error during login.");
      setError("Network error. Please check your connection.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none bg-transparent">
      <CardContent className="p-6 space-y-6">
        {/* Logo */}
        {/* <div className="text-left">
          <h1 className="text-2xl font-semibold text-foreground italic">Air</h1>
        </div> */}

        {/* Icon and Welcome Message */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/HolanSL_logo.png"
                width={150}
                height={150}
                alt="logo"
              />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome back!
          </h2>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{`${error}`}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-muted-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm font-medium text-muted-foreground">
                      Password
                    </FormLabel>
                    {/* <button
                      type="button"
                      className="text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Forgot password?
                    </button> */}
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-[#0B4F8A] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-brand-navy hover:bg-brand-blue text-white font-medium py-2 px-4 rounded-md mt-6"
            >
              {form.formState.isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
