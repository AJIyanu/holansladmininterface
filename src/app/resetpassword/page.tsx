import Link from "next/link";
import { AlertTriangle, LockKeyhole } from "lucide-react";

import ResetPasswordForm from "@/features/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

async function verifyResetCode(code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/auth/password-reset/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!data.valid || !data.user) {
    return null;
  }

  return data.user as {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const code = params.code;

  if (!code) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-[3] flex items-center justify-center p-8 bg-background bg-blue-100">
          <div className="w-full max-w-md">
            <ResetPasswordShell>
              <InvalidResetLink
                title="Reset code missing"
                description="The password reset link is missing a reset code."
              />
            </ResetPasswordShell>
          </div>
        </div>

        <div className="hidden lg:flex flex-[2] bg-primary bg-[url(/login_bg.webp)] bg-cover relative overflow-hidden"></div>
      </div>
    );
  }

  const user = await verifyResetCode(code);

  if (!user) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-[3] flex items-center justify-center p-8 bg-background bg-blue-100">
          <div className="w-full max-w-md">
            <ResetPasswordShell>
              <InvalidResetLink
                title="Invalid or expired link"
                description="This password reset link is invalid, expired or already used."
              />
            </ResetPasswordShell>
          </div>
        </div>

        <div className="hidden lg:flex flex-[2] bg-primary bg-[url(/login_bg.webp)] bg-cover relative overflow-hidden"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-[3] flex items-center justify-center p-8 bg-background bg-blue-100">
        <div className="w-full max-w-md">
          <ResetPasswordShell>
            <ResetPasswordForm code={code} user={user} />
          </ResetPasswordShell>
        </div>
      </div>

      <div className="hidden lg:flex flex-[2] bg-primary bg-[url(/login_bg.webp)] bg-cover relative overflow-hidden"></div>
    </div>
  );
}

function ResetPasswordShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-blue-50 p-3 text-[#0B4F8A]">
            <LockKeyhole className="size-8" />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}

function InvalidResetLink({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 rounded-full bg-red-50 p-3 text-red-600">
          <AlertTriangle className="size-8" />
        </div>

        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Button asChild className="w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
